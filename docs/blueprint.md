# **App Name**: Caffeine Web

## Core Features:

- Start/Stop Switch: Toggle the functionality to prevent the screen from sleeping.
- Screen Wake Lock: Use the Screen Wake Lock API to keep the screen on.
- Fallback Mechanism: Automatically scroll the page slightly up and down every 3-5 seconds if Wake Lock API fails, calling: window.scrollBy(0,10); window.scrollBy(0,-10);
- Simulated Keystrokes: Automatically type in the textbox, simulating a user pressing keys to keep the system awake.
- Status Indicator: Display status messages indicating the current mode: Wake Lock Active, Fallback Active, or Stopped.

## Style Guidelines:

- Primary color: Dark indigo (#4B0082) to convey reliability.
- Background color: Very dark gray (#121212), for a modern dark theme.
- Accent color: Teal (#008080), providing a contrasting color for active states and important elements.
- Body and headline font: 'Inter' (sans-serif) for clear and readable text.
- Centered layout with large rounded buttons for an accessible user interface.
- Subtle animations for status transitions.