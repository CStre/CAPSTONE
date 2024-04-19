import os
import requests
import random
import logging
from dotenv import load_dotenv

load_dotenv()

places = ['tourist_attraction', 
    'university', 
    'park', 
    'city_hall', 
    'courthouse', 
    'campground', 
    'embassy'
]

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

# Setup logging
logging.basicConfig(filename='debug_log.txt', level=logging.INFO, format='%(asctime)s - %(message)s')
failures = {location['name']: 0 for location in locations}

def update_failure_count(location_name):
    failures[location_name] += 1

def get_nearby_place(api_key, location, radius=32187, max_width=400): # 20 miles radius. 
    place_type = random.choice(places)
    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{location['lat']},{location['lon']}",
        "radius": radius,
        "type": place_type,
        "key": api_key
    }
    try:
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            results = response.json().get('results', [])
            return random.choice(results) if results else None
        else:
            print(f"Failed to fetch places: {response.status_code}")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def display_image(api_key, place, location_name):
    if place and 'photos' in place:
        photo_reference = place['photos'][0]['photo_reference']
        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={api_key}"
        print(f"Fetching photo URL: {photo_url}")
        metadata = place.get('name', location_name)  # Use place name as metadata
        try:
            if not is_duplicate(metadata, location_name):
                write_photo_history(location_name, metadata)
                return True
            else:
                print(f"Duplicate detected based on metadata for {location_name}.")
                return False
        except Exception as e:
            print(f"Error processing image display: {e}")
            return False
    return False



def select_location_based_on_probability(probabilities, locations):
    if len(probabilities) != len(locations):
        raise ValueError("Probabilities and locations must have the same length.")
    chosen_index = random.choices(range(len(locations)), weights=probabilities, k=1)[0]
    return locations[chosen_index]

def attempt_fetch_image(api_key, selected_location, max_attempts=10):
    attempts = 0
    print(f"Attempting to fetch image for {selected_location['name']}")
    while attempts < max_attempts:
        place = get_nearby_place(api_key, selected_location)
        if place:
            try:
                if display_image(api_key, place, selected_location['name'].replace(' ', '_')):
                    print(f"Successfully fetched a unique image for {selected_location['name']}")
                    return True
                else:
                    print(f"Attempt {attempts + 1}: Duplicate or failed to fetch a unique image.")
            except UnicodeEncodeError:
                print("Unicode error encountered, retrying...")
                continue  # This will not increment the attempt counter
        else:
            print(f"Attempt {attempts + 1}: No place found or API error.")
        attempts += 1
    update_failure_count(selected_location['name'])
    print(f"Failed to fetch a unique image for {selected_location['name']} after {max_attempts} attempts.")
    return False


def is_duplicate(metadata, location_name):
    """Check if metadata already exists in the history."""
    history = read_photo_history(location_name)
    return metadata in history

def write_photo_history(location_name, metadata):
    """Writes the new photo URL to the file, ensuring only the last 30 are kept in a circular manner."""
    history = read_photo_history(location_name)
    if len(history) < 30:
        history.append(metadata)
    else:
        # Rotate the list and replace the first element
        history = history[1:] + [metadata]

    # Write the updated list back to the file
    try:
        with open(f"{location_name}_history.txt", "w") as file:
            for item in history:
                file.write(f"{item}\n")
    except UnicodeEncodeError:
        print("Failed to write history due to encoding issue. Skipping this entry.")


def read_photo_history(location_name):
    """Reads the photo history from a file and returns a list of photo URLs."""
    try:
        with open(f"{location_name}_history.txt", "r") as file:
            history = [line.strip() for line in file if line.strip()]
            return history
    except FileNotFoundError:
        return []

def run_process(times=100):
    api_key = os.getenv('KEY')
    probabilities = [1] * len(locations)
    for _ in range(times):
        selected_location = select_location_based_on_probability(probabilities, locations)
        if selected_location:
            attempt_fetch_image(api_key, selected_location)
    # After all attempts, log the total failure counts
    for location, count in failures.items():
        logging.info(f"Total failures for {location}: {count}")

if __name__ == '__main__':
    run_process()