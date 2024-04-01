import os

from dotenv import load_dotenv
load_dotenv()

import googlemaps
from datetime import datetime

# Initialize the Google Maps client with your API key
gmaps = googlemaps.Client(key=os.environ.get('KEY'))

# Specify the location (latitude and longitude) you want to search for
latitude = 40.7128  # Example latitude (New York City)
longitude = -74.0060  # Example longitude (New York City)
location = (latitude, longitude)

# Perform a nearby search for places
places = gmaps.places_nearby(location=location, radius=1000, type='point_of_interest')

# Iterate through the places and retrieve photos
for place in places['results']:
    place_id = place['place_id']
    photos = gmaps.place(place_id)['result'].get('photos', [])
    if photos:
        for photo in photos:
            photo_reference = photo['photo_reference']
            # Use the photo reference to retrieve the photo URL
            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key=YOUR_API_KEY"
            print(photo_url)
