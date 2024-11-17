from django import template

register = template.Library()

@register.filter
def attr(obj, field_name):
    """
    Custom template filter to access an object's attribute dynamically by name.
    Usage: {{ object|attr:"field_name" }}
    """
    return getattr(obj, field_name, '')