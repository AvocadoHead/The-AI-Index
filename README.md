# The AI Index

A 3D interactive visualization of AI modules and tools.

## Features

- Interactive 3D cloud of AI modules
- Category filtering
- Premium tier with access to over 400 AI modules
- User authentication
- Save and load module collections
- Add, edit, and delete modules
- Dark mode support
- Multiple payment options including Bit (Israel)

## Security Features

- Content Security Policy (CSP) headers
- Input sanitization to prevent XSS attacks
- URL validation
- Rate limiting for authentication attempts
- CSRF protection
- Secure password handling

## Setup

1. Clone the repository
2. Open index.html in a web browser
3. Sign up for an account or log in
4. Explore the AI module cloud

## Premium Access

Get access to over 400 AI modules for a one-time payment of $5.

Payment options:
1. Email request to Eyalizenman@gmail.com
2. Bit payment (Israel) to +972 547731650

## Development

The site uses:
- Vanilla JavaScript
- Supabase for authentication and database
- HTML5 Canvas for 3D visualization

## File Structure

- `index.html` - Main HTML file
- `script.js` - Main JavaScript file with ModuleCloud implementation
- `database_modules.js` - Database connection and module loading
- `modules.js` - Default modules data
- `premium_tier_modules.js` - Premium modules data
- `user-functions.js` - Enhanced security functions
- `styles.css` - Main CSS styles
- `additional-styles.css` - Additional CSS styles
- `auth-styles.css` - Authentication-related styles

## Recent Fixes

- Fixed database connection issues
- Implemented proper premium tier recognition
- Repaired UI functionality including category menu toggle
- Added Bit payment option
- Enhanced security measures
- Fixed 3D cloud rendering
