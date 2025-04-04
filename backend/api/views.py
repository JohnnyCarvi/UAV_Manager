# backend/api/views.py
from rest_framework import generics, permissions
from datetime import datetime
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db import models
from .models import (
    UAV, FlightLog, MaintenanceLog, MaintenanceReminder, File, User, UserSettings
)
from .serializers import (
    UAVSerializer, FlightLogSerializer, MaintenanceLogSerializer,
    MaintenanceReminderSerializer, FileSerializer, UserSerializer, UserSettingsSerializer
)

# Endpunkte für UAVs (USERS besitzt UAVs)
class UAVListCreateView(generics.ListCreateAPIView):
    serializer_class = UAVSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UAV.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        uav = serializer.save(user=self.request.user)
        self._update_maintenance_reminders(uav, serializer.validated_data)
    
    def _update_maintenance_reminders(self, uav, data):
        # Process maintenance reminders
        components = ['props', 'motor', 'frame']
        for component in components:
            maint_date_key = f'{component}_maint_date'
            reminder_date_key = f'{component}_reminder_date'
            
            # Skip if no maintenance date is provided
            if maint_date_key not in data or data[maint_date_key] is None:
                continue
            
            last_maintenance = data[maint_date_key]
            next_maintenance = data.get(reminder_date_key, None)
            
            # If no next_maintenance date, default to 1 year later
            if next_maintenance is None and last_maintenance is not None:
                next_year = datetime(
                    last_maintenance.year + 1, 
                    last_maintenance.month, 
                    last_maintenance.day
                )
                next_maintenance = next_year
            
            # Create or update reminder
            if last_maintenance:
                # Check if a reminder for this component already exists
                reminder, created = MaintenanceReminder.objects.update_or_create(
                    uav=uav,
                    component=component,
                    defaults={
                        'last_maintenance': last_maintenance,
                        'next_maintenance': next_maintenance,
                        'reminder_active': True
                    }
                )
    
    # Add a method to list response with flight stats
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        # Add flight statistics to each UAV in the response
        for uav_data in response.data:
            uav_id = uav_data['uav_id']
            uav_data['total_flights'] = FlightLog.objects.filter(uav_id=uav_id).count()
            uav_data['total_flight_hours'] = FlightLog.get_total_flight_hours(uav_id)
            uav_data['total_flight_time'] = FlightLog.get_total_flight_hours(uav_id) * 3600  # Convert hours to seconds
            uav_data['total_landings'] = FlightLog.get_total_landings(uav_id)
            uav_data['total_takeoffs'] = FlightLog.get_total_takeoffs(uav_id)
            
        return response

class UAVDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UAVSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UAV.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        uav = serializer.save()
        self._update_maintenance_reminders(uav, serializer.validated_data)
    
    def _update_maintenance_reminders(self, uav, data):
        # Process maintenance reminders
        components = ['props', 'motor', 'frame']
        for component in components:
            maint_date_key = f'{component}_maint_date'
            reminder_date_key = f'{component}_reminder_date'
            
            # Only update if the field is in the data
            if maint_date_key not in data:
                continue
            
            last_maintenance = data[maint_date_key]
            next_maintenance = data.get(reminder_date_key, None)
            
            # If maintenance date is None, we might want to delete any existing reminder
            if last_maintenance is None:
                MaintenanceReminder.objects.filter(uav=uav, component=component).delete()
                continue
            
            # If no next_maintenance date, default to 1 year later
            if next_maintenance is None and last_maintenance is not None:
                next_year = datetime(
                    last_maintenance.year + 1, 
                    last_maintenance.month, 
                    last_maintenance.day
                )
                next_maintenance = next_year
            
            # Create or update reminder
            reminder, created = MaintenanceReminder.objects.update_or_create(
                uav=uav,
                component=component,
                defaults={
                    'last_maintenance': last_maintenance,
                    'next_maintenance': next_maintenance,
                    'reminder_active': True
                }
            )
    
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        uav_id = self.get_object().uav_id
        
        # Fügt alle Flugstatistiken hinzu, die auch in der list-Methode vorhanden sind
        response.data['total_flights'] = FlightLog.objects.filter(uav_id=uav_id).count()
        response.data['total_flight_hours'] = FlightLog.get_total_flight_hours(uav_id)
        response.data['total_flight_time'] = FlightLog.get_total_flight_hours(uav_id) * 3600  # Konvertiert Stunden in Sekunden
        response.data['total_landings'] = FlightLog.get_total_landings(uav_id)
        response.data['total_takeoffs'] = FlightLog.get_total_takeoffs(uav_id)
        
        return response

# Endpunkte für Fluglogs
class FlightLogListCreateView(generics.ListCreateAPIView):
    serializer_class = FlightLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FlightLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FlightLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FlightLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FlightLog.objects.filter(user=self.request.user)

# Endpunkte für Wartungsprotokolle
class MaintenanceLogListCreateView(generics.ListCreateAPIView):
    serializer_class = MaintenanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        uav_id = self.request.query_params.get('uav')
        queryset = MaintenanceLog.objects.filter(user=self.request.user)
        if uav_id:
            queryset = queryset.filter(uav_id=uav_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # Automatically set the user field

class MaintenanceLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MaintenanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MaintenanceLog.objects.filter(user=self.request.user)

# Endpunkte für Wartungserinnerungen
class MaintenanceReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = MaintenanceReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter reminders for UAVs that belong to the current user
        return MaintenanceReminder.objects.filter(uav__user=self.request.user)

class MaintenanceReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MaintenanceReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MaintenanceReminder.objects.filter(uav__user=self.request.user)

# Endpunkte für Dateien
class FileListCreateView(generics.ListCreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return File.objects.filter(uav__user=self.request.user)

class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return File.objects.filter(uav__user=self.request.user)

# Angepasste Endpunkte für Benutzer und Benutzereinstellungen
class UserListCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Gibt nur das aktuell authentifizierte Benutzerobjekt zurück
        return User.objects.filter(pk=self.request.user.pk)

# Der Benutzer kann nur sein eigenes Profil abrufen, aktualisieren oder löschen.
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Gibt immer das aktuell authentifizierte Benutzerobjekt zurück
        return self.request.user

# Endpunkte für Benutzereinstellungen
class UserSettingsListCreateView(generics.ListCreateAPIView):
    serializer_class = UserSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSettings.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserSettingsDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSettings.objects.filter(user=self.request.user)