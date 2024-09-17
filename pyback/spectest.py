import vlc
import time
import json
import matplotlib.pyplot as plt
import numpy as np

# Sample segment data (from Spotify API)
segment_data = json.load(open("track.json", "r"))

# Function to play the song using VLC
def play_song(file_path):
    player = vlc.MediaPlayer(file_path)
    player.play()
    return player

# Function to get the current time in the song
def get_song_position(player):
    return player.get_time() / 1000  # Get time in seconds

# Function to display the visualizer
"""def display_visualizer(pitch_data):
    print(pitch_data)"""
def display_visualizer(loudness_max):
    plt.clf()
    normalized_loudness = (loudness_max + 60) / 30  # Scaled to a larger range (from 0 to 3)
    
    # Exaggerate the swing: Use a multiplier to make it more dramatic
    exaggerated_loudness = normalized_loudness-1 # Make sure it doesn't go below 0
    print(int(exaggerated_loudness*20)*"#")
    plt.bar([0], [exaggerated_loudness], color='blue', width=0.5)
    plt.ylim(0, 1)
    plt.draw()
    plt.pause(0.01)

# Main function to sync and visualize audio segments
def sync_visualizer(player, segment_data):
    plt.ion()  # Interactive mode on for live updating
    plt.figure()

    while True:
        current_time = get_song_position(player)

        # Find the current segment
        for segment in segment_data:
            if segment['start'] <= current_time <= (segment['start'] + segment['duration']):
                # Visualize the segment's loudness_max data
                display_visualizer(segment['loudness_max'])
                break

        # Check if song is still playing
        if not player.is_playing():
            break

        time.sleep(0.05)  # Small delay to avoid CPU overuse

    plt.ioff()
    plt.show()

# Example usage
if __name__ == "__main__":
    song_path = "pyback/track.mp3"
    player = play_song(song_path)
    
    sync_visualizer(player, segment_data)