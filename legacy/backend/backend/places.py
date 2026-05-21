import os
import requests
import random
import numpy as np
import logging
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Possible types of places to fetch
places = ['tourist_attraction']

# List of locations with their latitude and longitude
locations = [
    {"name": "Helsinki, Finland", "lat": 60.1699, "lon": 24.9384},
    {"name": "Oslo, Norway", "lat": 59.9139, "lon": 10.7522},
    {"name": "Rome, Italy", "lat": 41.9028, "lon": 12.4964},
    {"name": "Reykjavik, Iceland", "lat": 64.1466, "lon": -21.9426},
    {"name": "New York City, US", "lat": 40.7128, "lon": -74.0060},
    {"name": "Vancouver, Canada", "lat": 49.2827, "lon": -123.1207},
    {"name": "Cairo, Egypt", "lat": 30.0444, "lon": 31.2357},
    {"name": "Hong Kong, China", "lat": 22.3193, "lon": 114.1694},
    {"name": "Singapore", "lat": 1.3521, "lon": 103.8198},
    {"name": "Rio de Janeiro, Brazil", "lat": -22.9068, "lon": -43.1729},
    {"name": "Sydney, Australia", "lat": -33.8688, "lon": 151.2093},
    {"name": "Auckland, New Zealand", "lat": -36.8485, "lon": 174.7633}
]

def run_process(preferences, times=8):
    logger.info(f"Received preferences: {preferences}")

    # Validate that preferences is a list and possibly convert string digits to integers
    if isinstance(preferences, list):
        try:
            # Ensure all elements are integers (this step may not be necessary if already validated)
            preferences = [int(p) for p in preferences if isinstance(p, int) or (isinstance(p, str) and p.isdigit())]
            logger.info(f"Validated preferences as integers: {preferences}")
        except ValueError as e:
            logger.error(f"Error validating preferences as integers: {e}")
            return []  # Return an empty list or handle the error more appropriately

    if not preferences:
        logger.warning("Preferences list is empty after validation.")
        return []

    api_key = os.getenv('KEY')
    results = preferences[:]  # Copy validated preferences
    logger.debug(f"Starting image fetching process with validated preferences: {preferences}")

    # Calculate the total preference to normalize it
    total_preference = sum(preferences)
    if total_preference == 0:
        logger.error("Total preference sum is zero, cannot proceed with weighted random choice.")
        return []

    # Generate weights for the random choice
    weights = [p / total_preference for p in preferences]

    for _ in range(times):
        location_index = np.random.choice(range(len(locations)), p=weights)
        selected_location = locations[location_index]
        logger.debug(f"Selected location: {selected_location['name']} at index {location_index}")

        image_info = attempt_fetch_image(api_key, selected_location, location_index)
        if image_info:
            results.append(image_info)
            logger.debug(f"Image info added: {image_info}")
        else:
            logger.warning(f"Failed to fetch image for location: {selected_location['name']}")

    return results


def attempt_fetch_image(api_key, selected_location, location_index, max_attempts=5):
    attempts = 0
    while attempts < max_attempts:
        place = get_nearby_place(api_key, selected_location)
        if place:
            image_info = display_image(api_key, place, location_index)
            if image_info:
                return image_info
        attempts += 1
        logger.debug(f"Attempt {attempts} failed for location: {selected_location['name']}")
    logger.error(f"Failed to fetch image after {max_attempts} attempts for location: {selected_location['name']}")
    return None

def get_nearby_place(api_key, location):
    place_type = random.choice(places)
    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{location['lat']},{location['lon']}",
        "radius": 50000,
        "type": place_type,
        "key": api_key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        results = response.json().get('results', [])
        if results:
            return random.choice(results)
        else:
            logger.info(f"No places found near {location['name']}")
    else:
        logger.error(f"API request failed with status {response.status_code} for location: {location['name']}")
    return None

def display_image(api_key, place, location_index):
    if place and 'photos' in place:
        photo_reference = place['photos'][0]['photo_reference']
        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=8000&photoreference={photo_reference}&key={api_key}"
        logger.info(f"Fetched image URL for location {locations[location_index]['name']}: {photo_url}")
        return f"{location_index}:{photo_url}"  # Ensure index is properly converted to string
    logger.info(f"No photo available for place near {locations[location_index]['name']}")
    return None


if __name__ == '__main__':
    user_preferences = [0.8, 0.6, 0.5, 0.4, 0.7, 0.2, 0.1, 0.3, 0.9, 0.85, 0.75, 0.65]
    results = run_process(user_preferences)
    print("Final output:", results)
