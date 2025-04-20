from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form     = CustomUserChangeForm
    model    = CustomUser

    fieldsets = (
        (None,               {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('name',)}),
        ('Permisos',         {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2'),
        }),
    )
    list_display  = ('email', 'name', 'is_staff')
    search_fields = ('email', 'name')
    ordering      = ('email',)
