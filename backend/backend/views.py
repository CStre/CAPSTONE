from django.shortcuts import render
from django.http import JsonResponse
from .models import TestModel

def index(request):
    return render(request, 'index.html')

def test_db(request):
    new_entry = TestModel(name="Test Entry")
    new_entry.save()
    return JsonResponse({'message': 'Data added successfully!'})
