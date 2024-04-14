import osmnx as ox
from geopy.geocoders import Nominatim

def get_osm_data(location_name):
    # Initialize Nominatim geocoder
    geolocator = Nominatim(user_agent="osm_example")

    # Get latitude and longitude of the location
    location = geolocator.geocode(location_name)
    if location is None:
        print("Location not found.")
        return
    
    # Retrieve OpenStreetMap data using OSMnx
    G = ox.graph_from_place(location_name, network_type='all')
    
    # Plot the street network
    ox.plot_graph(G, figsize=(10, 10))

# Example usage:
location_name = input("Enter a location: ")
get_osm_data(location_name)
