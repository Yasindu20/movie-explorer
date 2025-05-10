# Movie Explorer App

A React application for discovering movies, viewing details, and saving favorites using the TMDb API.

## Features

- **User Authentication**: Simple login system with demo credentials
- **Movie Discovery**: Browse trending movies from TMDb
- **Search Functionality**: Search for movies by title
- **Movie Details**: View comprehensive information about movies including:
  - Overview, genres, rating, release date, runtime
  - Cast information
  - Trailers (via YouTube)
  - Production companies
- **Favorites Management**: Add/remove movies to a favorites list
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Infinite Scrolling**: Load more results automatically as you scroll
- **Error Handling**: User-friendly error messages

## Setup and Installation

### Prerequisites

- Node.js and npm installed
- TMDb API key (get one at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd movie-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your TMDb API key:
   ```
   REACT_APP_TMDB_API_KEY=your_api_key_here
   ```

4. Update the API key in `src/api/tmdbApi.js` with your key.

5. Start the development server:
   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
movie-explorer/
│
├── public/
│   ├── index.html
│   └── ...
│
├── src/
│   ├── api/
│   │   └── tmdbApi.js        # API configuration and helper functions
│   │
│   ├── components/
│   │   ├── Header.js         # App header with navigation
│   │   ├── LoginForm.js      # User authentication form
│   │   ├── MovieCard.js      # Card component for movie display
│   │   └── SearchBar.js      # Search input component
│   │
│   ├── context/
│   │   ├── AuthContext.js    # Authentication state management
│   │   └── MovieContext.js   # Movie data state management
│   │
│   ├── pages/
│   │   ├── FavoritesPage.js      # User's favorite movies
│   │   ├── HomePage.js           # Trending movies display
│   │   ├── LoginPage.js          # User login
│   │   ├── MovieDetailsPage.js   # Detailed movie information
│   │   └── SearchResultsPage.js  # Search results display
│   │
│   ├── App.js              # Main app component with routing
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
│
├── .env                    # Environment variables (not in repo)
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Technologies Used

- **React**: Frontend library
- **React Router**: Navigation and routing
- **Context API**: State management
- **Material-UI**: UI component library
- **Axios**: HTTP client for API requests
- **TMDb API**: Movie data source
- **YouTube API**: For embedded trailers
- **LocalStorage**: For saving user preferences and favorites

## Deployment

The app can be deployed using Vercel or Netlify:

### Vercel Deployment

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com) and import your project
3. Set the environment variables for your API key
4. Deploy

### Netlify Deployment

1. Push your code to a GitHub repository
2. Visit [Netlify](https://netlify.com) and import your project
3. Set the environment variables for your API key
4. Deploy

## Demo Credentials

For testing the application, use:
- Username: `user`
- Password: `password`

## Future Enhancements

- User registration
- Movie recommendations
- Filter by genre, year, and rating
- User reviews and ratings
- Watch list functionality
- Multi-language support

## License

[MIT License](LICENSE)

## Acknowledgements

- [TMDb API](https://developers.themoviedb.org/3) for movie data
- [Material-UI](https://mui.com/) for the component library
- [React Documentation](https://reactjs.org/docs)