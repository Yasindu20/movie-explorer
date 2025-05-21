import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { fetchMovieDetails } from '../api/tmdbApi';
import { useAuth } from './AuthContext';
import { useMovieContext } from './MovieContext';

// Create recommendation context
const RecommendationContext = createContext();

// Initial state
const initialState = {
    watchHistory: [],
    userRatings: {},
    recommendedMovies: {
        basedOnHistory: [],
        basedOnGenres: [],
        basedOnActors: [],
        topPicks: []
    },
    favoriteGenres: {},
    favoriteActors: {},
    favoriteDirectors: {},
    isLoading: false,
    error: null,
};

// Actions
const actions = {
    ADD_TO_WATCH_HISTORY: 'ADD_TO_WATCH_HISTORY',
    ADD_USER_RATING: 'ADD_USER_RATING',
    SET_RECOMMENDED_MOVIES: 'SET_RECOMMENDED_MOVIES',
    UPDATE_GENRE_PREFERENCES: 'UPDATE_GENRE_PREFERENCES',
    UPDATE_ACTOR_PREFERENCES: 'UPDATE_ACTOR_PREFERENCES',
    UPDATE_DIRECTOR_PREFERENCES: 'UPDATE_DIRECTOR_PREFERENCES',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
};

// Reducer
const recommendationReducer = (state, action) => {
    switch (action.type) {
        case actions.ADD_TO_WATCH_HISTORY:
            return {
                ...state,
                watchHistory: [
                    action.payload,
                    ...state.watchHistory.filter(movie => movie.id !== action.payload.id)
                ].slice(0, 50) // Keep only last 50 items for performance
            };

        case actions.ADD_USER_RATING:
            return {
                ...state,
                userRatings: {
                    ...state.userRatings,
                    [action.payload.movieId]: {
                        rating: action.payload.rating,
                        timestamp: action.payload.timestamp
                    }
                }
            };

        case actions.SET_RECOMMENDED_MOVIES:
            return {
                ...state,
                recommendedMovies: {
                    ...state.recommendedMovies,
                    [action.payload.category]: action.payload.movies
                }
            };

        case actions.UPDATE_GENRE_PREFERENCES:
            return {
                ...state,
                favoriteGenres: action.payload
            };

        case actions.UPDATE_ACTOR_PREFERENCES:
            return {
                ...state,
                favoriteActors: action.payload
            };

        case actions.UPDATE_DIRECTOR_PREFERENCES:
            return {
                ...state,
                favoriteDirectors: action.payload
            };

        case actions.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case actions.SET_ERROR:
            return {
                ...state,
                error: action.payload
            };

        default:
            return state;
    }
};

export const RecommendationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(recommendationReducer, initialState);
    const { user } = useAuth();
    const { favorites } = useMovieContext();

    // Create refs to store function references (to fix circular dependencies)
    const getHistoryRecommendationsRef = useRef(null);
    const getGenreRecommendationsRef = useRef(null);
    const getActorRecommendationsRef = useRef(null);
    const getPersonalizedTopPicksRef = useRef(null);

    // Define updateGenrePreferences before using it in hooks
    const updateGenrePreferences = useCallback(() => {
        // Create a map of genre popularity
        const genreScores = {};

        // Process watch history
        state.watchHistory.forEach((movie, index) => {
            // Weigh more recent views higher
            const recencyWeight = 1 / (index + 1);

            // Process each genre
            if (movie.genres) {
                movie.genres.forEach(genre => {
                    if (!genreScores[genre.id]) {
                        genreScores[genre.id] = {
                            id: genre.id,
                            name: genre.name,
                            score: 0,
                            count: 0
                        };
                    }

                    genreScores[genre.id].count += 1;

                    // Base score for watching a movie of this genre
                    genreScores[genre.id].score += 1 * recencyWeight;

                    // Additional score if the movie was rated highly
                    if (state.userRatings[movie.id] && state.userRatings[movie.id].rating > 3) {
                        genreScores[genre.id].score += (state.userRatings[movie.id].rating - 3) * 2;
                    }

                    // Additional score if the movie is in favorites
                    if (favorites.some(fav => fav.id === movie.id)) {
                        genreScores[genre.id].score += 5;
                    }
                });
            }
        });

        // Sort genres by score
        const sortedGenres = Object.values(genreScores).sort((a, b) => b.score - a.score);

        // Create normalized scores (0-100)
        const maxScore = sortedGenres.length > 0 ? sortedGenres[0].score : 1;
        const normalizedGenres = {};

        sortedGenres.forEach(genre => {
            normalizedGenres[genre.id] = {
                ...genre,
                normalizedScore: Math.round((genre.score / maxScore) * 100)
            };
        });

        dispatch({ type: actions.UPDATE_GENRE_PREFERENCES, payload: normalizedGenres });
    }, [state.watchHistory, state.userRatings, favorites]);

    // Load user data from localStorage
    useEffect(() => {
        if (user) {
            const loadUserData = () => {
                try {
                    const watchHistory = JSON.parse(localStorage.getItem(`${user.username}_watchHistory`)) || [];
                    const userRatings = JSON.parse(localStorage.getItem(`${user.username}_userRatings`)) || {};
                    const favoriteGenres = JSON.parse(localStorage.getItem(`${user.username}_favoriteGenres`)) || {};
                    const favoriteActors = JSON.parse(localStorage.getItem(`${user.username}_favoriteActors`)) || {};
                    const favoriteDirectors = JSON.parse(localStorage.getItem(`${user.username}_favoriteDirectors`)) || {};

                    if (watchHistory.length > 0) {
                        dispatch({ type: actions.ADD_TO_WATCH_HISTORY, payload: watchHistory });
                    }

                    if (Object.keys(userRatings).length > 0) {
                        Object.entries(userRatings).forEach(([movieId, data]) => {
                            dispatch({
                                type: actions.ADD_USER_RATING,
                                payload: {
                                    movieId: parseInt(movieId, 10),
                                    rating: data.rating,
                                    timestamp: data.timestamp
                                }
                            });
                        });
                    }

                    if (Object.keys(favoriteGenres).length > 0) {
                        dispatch({ type: actions.UPDATE_GENRE_PREFERENCES, payload: favoriteGenres });
                    }

                    if (Object.keys(favoriteActors).length > 0) {
                        dispatch({ type: actions.UPDATE_ACTOR_PREFERENCES, payload: favoriteActors });
                    }

                    if (Object.keys(favoriteDirectors).length > 0) {
                        dispatch({ type: actions.UPDATE_DIRECTOR_PREFERENCES, payload: favoriteDirectors });
                    }
                } catch (error) {
                    console.error('Error loading user recommendation data:', error);
                }
            };

            loadUserData();
        }
    }, [user]);

    // Save data to localStorage when state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(`${user.username}_watchHistory`, JSON.stringify(state.watchHistory));
            localStorage.setItem(`${user.username}_userRatings`, JSON.stringify(state.userRatings));
            localStorage.setItem(`${user.username}_favoriteGenres`, JSON.stringify(state.favoriteGenres));
            localStorage.setItem(`${user.username}_favoriteActors`, JSON.stringify(state.favoriteActors));
            localStorage.setItem(`${user.username}_favoriteDirectors`, JSON.stringify(state.favoriteDirectors));
        }
    }, [
        user,
        state.watchHistory,
        state.userRatings,
        state.favoriteGenres,
        state.favoriteActors,
        state.favoriteDirectors
    ]);

    // Update favoriteGenres when a movie is added to watch history or rated
    useEffect(() => {
        if (state.watchHistory.length > 0) {
            updateGenrePreferences();
        }
    }, [state.watchHistory, state.userRatings, favorites, updateGenrePreferences]);

    // Add a movie to watch history
    const addToWatchHistory = useCallback(async (movieId, movieData = null) => {
        try {
            dispatch({ type: actions.SET_LOADING, payload: true });

            // Check if movie is already in watch history
            const existingMovie = state.watchHistory.find(m => m.id === movieId);

            if (existingMovie) {
                // If already in history, just move it to the top
                dispatch({
                    type: actions.ADD_TO_WATCH_HISTORY,
                    payload: {
                        ...existingMovie,
                        lastWatchedAt: new Date().toISOString()
                    }
                });
            } else if (movieData) {
                // If movie data was provided, use it directly
                dispatch({
                    type: actions.ADD_TO_WATCH_HISTORY,
                    payload: {
                        ...movieData,
                        lastWatchedAt: new Date().toISOString()
                    }
                });
            } else {
                // Only fetch if we don't have the data
                const movieDetails = await fetchMovieDetails(movieId);

                dispatch({
                    type: actions.ADD_TO_WATCH_HISTORY,
                    payload: {
                        ...movieDetails,
                        lastWatchedAt: new Date().toISOString()
                    }
                });
            }

            dispatch({ type: actions.SET_LOADING, payload: false });
        } catch (error) {
            console.error('Error adding to watch history:', error);
            dispatch({ type: actions.SET_ERROR, payload: 'Failed to add movie to watch history' });
            dispatch({ type: actions.SET_LOADING, payload: false });
        }
    }, [state.watchHistory]);

    // Rate a movie
    const rateMovie = useCallback((movieId, rating) => {
        dispatch({
            type: actions.ADD_USER_RATING,
            payload: {
                movieId,
                rating,
                timestamp: new Date().toISOString()
            }
        });
    }, []);

    // Update actor preferences based on watch history and ratings
    const updateActorPreferences = useCallback(async () => {
        const actorScores = {};

        // Process movies in watch history to extract actors
        for (const movie of state.watchHistory) {
            if (movie.credits && movie.credits.cast) {
                // Only consider the top 5 billed actors
                const topCast = movie.credits.cast.slice(0, 5);

                topCast.forEach((actor, index) => {
                    const billingScore = 5 - index; // Higher score for top-billed actors

                    if (!actorScores[actor.id]) {
                        actorScores[actor.id] = {
                            id: actor.id,
                            name: actor.name,
                            profile_path: actor.profile_path,
                            score: 0,
                            count: 0,
                            movies: []
                        };
                    }

                    actorScores[actor.id].count += 1;
                    actorScores[actor.id].score += billingScore;

                    // Additional score if the movie was rated highly
                    if (state.userRatings[movie.id] && state.userRatings[movie.id].rating > 3) {
                        actorScores[actor.id].score += (state.userRatings[movie.id].rating - 3) * 2;
                    }

                    // Additional score if the movie is in favorites
                    if (favorites.some(fav => fav.id === movie.id)) {
                        actorScores[actor.id].score += 5;
                    }

                    // Add movie to actor's filmography
                    if (!actorScores[actor.id].movies.includes(movie.id)) {
                        actorScores[actor.id].movies.push(movie.id);
                    }
                });
            }
        }

        // Sort actors by score
        const sortedActors = Object.values(actorScores).sort((a, b) => b.score - a.score);

        // Create normalized scores (0-100)
        const maxScore = sortedActors.length > 0 ? sortedActors[0].score : 1;
        const normalizedActors = {};

        sortedActors.forEach(actor => {
            normalizedActors[actor.id] = {
                ...actor,
                normalizedScore: Math.round((actor.score / maxScore) * 100)
            };
        });

        dispatch({ type: actions.UPDATE_ACTOR_PREFERENCES, payload: normalizedActors });
    }, [state.watchHistory, state.userRatings, favorites]);

    // Update director preferences
    const updateDirectorPreferences = useCallback(async () => {
        const directorScores = {};

        // Process movies in watch history to extract directors
        for (const movie of state.watchHistory) {
            if (movie.credits && movie.credits.crew) {
                // Find directors in the crew
                const directors = movie.credits.crew.filter(crewMember =>
                    crewMember.job === 'Director'
                );

                directors.forEach(director => {
                    if (!directorScores[director.id]) {
                        directorScores[director.id] = {
                            id: director.id,
                            name: director.name,
                            profile_path: director.profile_path,
                            score: 0,
                            count: 0,
                            movies: []
                        };
                    }

                    directorScores[director.id].count += 1;
                    directorScores[director.id].score += 3; // Base score for directing a watched movie

                    // Additional score if the movie was rated highly
                    if (state.userRatings[movie.id] && state.userRatings[movie.id].rating > 3) {
                        directorScores[director.id].score += (state.userRatings[movie.id].rating - 3) * 2;
                    }

                    // Additional score if the movie is in favorites
                    if (favorites.some(fav => fav.id === movie.id)) {
                        directorScores[director.id].score += 5;
                    }

                    // Add movie to director's filmography
                    if (!directorScores[director.id].movies.includes(movie.id)) {
                        directorScores[director.id].movies.push(movie.id);
                    }
                });
            }
        }

        // Sort directors by score
        const sortedDirectors = Object.values(directorScores).sort((a, b) => b.score - a.score);

        // Create normalized scores (0-100)
        const maxScore = sortedDirectors.length > 0 ? sortedDirectors[0].score : 1;
        const normalizedDirectors = {};

        sortedDirectors.forEach(director => {
            normalizedDirectors[director.id] = {
                ...director,
                normalizedScore: Math.round((director.score / maxScore) * 100)
            };
        });

        dispatch({ type: actions.UPDATE_DIRECTOR_PREFERENCES, payload: normalizedDirectors });
    }, [state.watchHistory, state.userRatings, favorites]);

    // When user preferences change, update actor and director preferences
    useEffect(() => {
        if (state.watchHistory.length > 0) {
            updateActorPreferences();
            updateDirectorPreferences();
        }
    }, [updateActorPreferences, updateDirectorPreferences, state.watchHistory]);

    // Returns a movie's similarity score to user preferences
    const calculateMovieSimilarity = useCallback((movie) => {
        if (!movie) return 0;

        let score = 0;
        const genreMultiplier = 2; // Genres are important
        const actorMultiplier = 1.5; // Actors somewhat important
        const directorMultiplier = 2.5; // Directors very important

        // Genre similarity
        if (movie.genres) {
            movie.genres.forEach(genre => {
                if (state.favoriteGenres[genre.id]) {
                    score += (state.favoriteGenres[genre.id].normalizedScore / 100) * genreMultiplier;
                }
            });
        } else if (movie.genre_ids) {
            movie.genre_ids.forEach(genreId => {
                if (state.favoriteGenres[genreId]) {
                    score += (state.favoriteGenres[genreId].normalizedScore / 100) * genreMultiplier;
                }
            });
        }

        // Actor similarity
        if (movie.credits && movie.credits.cast) {
            // Only consider the top 5 billed actors
            const topCast = movie.credits.cast.slice(0, 5);

            topCast.forEach((actor, index) => {
                const billingWeight = (5 - index) / 5; // Higher weight for top-billed actors
                if (state.favoriteActors[actor.id]) {
                    score += (state.favoriteActors[actor.id].normalizedScore / 100) * actorMultiplier * billingWeight;
                }
            });
        }

        // Director similarity
        if (movie.credits && movie.credits.crew) {
            // Find directors in the crew
            const directors = movie.credits.crew.filter(crewMember =>
                crewMember.job === 'Director'
            );

            directors.forEach(director => {
                if (state.favoriteDirectors[director.id]) {
                    score += (state.favoriteDirectors[director.id].normalizedScore / 100) * directorMultiplier;
                }
            });
        }

        return score;
    }, [state.favoriteGenres, state.favoriteActors, state.favoriteDirectors]);

    // Get recommended movies based on watch history
    const getRecommendationsBasedOnWatchHistory = useCallback(async () => {
        if (state.watchHistory.length === 0) return [];

        try {
            dispatch({ type: actions.SET_LOADING, payload: true });

            // Get the last 3 watched movies
            const recentMovies = state.watchHistory.slice(0, 3);
            const recommendationPromises = recentMovies.map(async (movie) => {
                try {
                    // Fetch recommendations from TMDb API
                    const response = await fetch(
                        `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=6f260ad398044fdb6affceaa84c86761&language=en-US&page=1`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch recommendations');
                    }

                    const data = await response.json();

                    // Add source movie info to each recommendation
                    return data.results.map(rec => ({
                        ...rec,
                        recommendedBecause: {
                            movieId: movie.id,
                            movieTitle: movie.title,
                            posterPath: movie.poster_path
                        }
                    }));
                } catch (error) {
                    console.error(`Error fetching recommendations for movie ${movie.id}:`, error);
                    return [];
                }
            });

            const recommendationsArrays = await Promise.all(recommendationPromises);

            // Flatten and deduplicate recommendations
            let allRecommendations = [];
            recommendationsArrays.forEach(recommendations => {
                allRecommendations = [...allRecommendations, ...recommendations];
            });

            // Remove duplicates and movies already in watch history
            const seen = new Set();
            const watchedIds = new Set(state.watchHistory.map(m => m.id));

            const uniqueRecommendations = allRecommendations.filter(movie => {
                const duplicate = seen.has(movie.id);
                const alreadyWatched = watchedIds.has(movie.id);

                if (!duplicate && !alreadyWatched) {
                    seen.add(movie.id);
                    return true;
                }

                return false;
            });

            // Sort by vote_average as a simple quality filter
            const sortedRecommendations = uniqueRecommendations
                .sort((a, b) => b.vote_average - a.vote_average)
                .slice(0, 10); // Limit to 10 recommendations

            dispatch({
                type: actions.SET_RECOMMENDED_MOVIES,
                payload: {
                    category: 'basedOnHistory',
                    movies: sortedRecommendations
                }
            });

            dispatch({ type: actions.SET_LOADING, payload: false });
            return sortedRecommendations;
        } catch (error) {
            console.error('Error getting history-based recommendations:', error);
            dispatch({ type: actions.SET_ERROR, payload: 'Failed to get recommendations' });
            dispatch({ type: actions.SET_LOADING, payload: false });
            return [];
        }
    }, [state.watchHistory]);

    // Store the history recommendations function in the ref
    useEffect(() => {
        getHistoryRecommendationsRef.current = getRecommendationsBasedOnWatchHistory;
    }, [getRecommendationsBasedOnWatchHistory]);

    // Get recommendations based on favorite genres
    const getRecommendationsBasedOnGenres = useCallback(async () => {
        const favoriteGenreIds = Object.keys(state.favoriteGenres);

        if (favoriteGenreIds.length === 0) return [];

        try {
            dispatch({ type: actions.SET_LOADING, payload: true });

            // Get top 3 genres
            const topGenres = Object.values(state.favoriteGenres)
                .sort((a, b) => b.normalizedScore - a.normalizedScore)
                .slice(0, 3);

            // Create comma-separated genre IDs for the API
            const genreParam = topGenres.map(genre => genre.id).join(',');

            // Fetch movies with these genres from TMDb API
            const response = await fetch(
                `https://api.themoviedb.org/3/discover/movie?api_key=6f260ad398044fdb6affceaa84c86761&language=en-US&sort_by=popularity.desc&include_adult=false&with_genres=${genreParam}&page=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch genre recommendations');
            }

            const data = await response.json();

            // Filter out movies already in watch history
            const watchedIds = new Set(state.watchHistory.map(m => m.id));
            const filteredRecommendations = data.results.filter(movie => !watchedIds.has(movie.id));

            // Add genre info to each movie
            const recommendationsWithGenreInfo = filteredRecommendations.map(movie => ({
                ...movie,
                recommendedBecause: {
                    genres: topGenres.map(genre => genre.name).join(', ')
                }
            }));

            dispatch({
                type: actions.SET_RECOMMENDED_MOVIES,
                payload: {
                    category: 'basedOnGenres',
                    movies: recommendationsWithGenreInfo.slice(0, 10)
                }
            });

            dispatch({ type: actions.SET_LOADING, payload: false });
            return recommendationsWithGenreInfo.slice(0, 10);
        } catch (error) {
            console.error('Error getting genre-based recommendations:', error);
            dispatch({ type: actions.SET_ERROR, payload: 'Failed to get genre recommendations' });
            dispatch({ type: actions.SET_LOADING, payload: false });
            return [];
        }
    }, [state.favoriteGenres, state.watchHistory]);

    // Store the genre recommendations function in the ref
    useEffect(() => {
        getGenreRecommendationsRef.current = getRecommendationsBasedOnGenres;
    }, [getRecommendationsBasedOnGenres]);

    // Get recommendations based on favorite actors
    const getRecommendationsBasedOnActors = useCallback(async () => {
        const favoriteActorIds = Object.keys(state.favoriteActors);

        if (favoriteActorIds.length === 0) return [];

        try {
            dispatch({ type: actions.SET_LOADING, payload: true });

            // Get top actor
            const topActor = Object.values(state.favoriteActors)
                .sort((a, b) => b.normalizedScore - a.normalizedScore)[0];

            if (!topActor) return [];

            // Fetch movies with this actor from TMDb API
            const response = await fetch(
                `https://api.themoviedb.org/3/discover/movie?api_key=6f260ad398044fdb6affceaa84c86761&language=en-US&sort_by=popularity.desc&include_adult=false&with_cast=${topActor.id}&page=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch actor recommendations');
            }

            const data = await response.json();

            // Filter out movies already in watch history
            const watchedIds = new Set(state.watchHistory.map(m => m.id));
            const filteredRecommendations = data.results.filter(movie => !watchedIds.has(movie.id));

            // Add actor info to each movie
            const recommendationsWithActorInfo = filteredRecommendations.map(movie => ({
                ...movie,
                recommendedBecause: {
                    actor: topActor.name
                }
            }));

            dispatch({
                type: actions.SET_RECOMMENDED_MOVIES,
                payload: {
                    category: 'basedOnActors',
                    movies: recommendationsWithActorInfo.slice(0, 10)
                }
            });

            dispatch({ type: actions.SET_LOADING, payload: false });
            return recommendationsWithActorInfo.slice(0, 10);
        } catch (error) {
            console.error('Error getting actor-based recommendations:', error);
            dispatch({ type: actions.SET_ERROR, payload: 'Failed to get actor recommendations' });
            dispatch({ type: actions.SET_LOADING, payload: false });
            return [];
        }
    }, [state.favoriteActors, state.watchHistory]);

    // Store the actor recommendations function in the ref
    useEffect(() => {
        getActorRecommendationsRef.current = getRecommendationsBasedOnActors;
    }, [getRecommendationsBasedOnActors]);

    // Get personalized top picks (combination of all recommendation types)
    // FIX: Remove unnecessary dependencies from the dependency array
    const getPersonalizedTopPicks = useCallback(async (historyRecsParam = null, genreRecsParam = null, actorRecsParam = null) => {
        try {
            dispatch({ type: actions.SET_LOADING, payload: true });

            // Use provided recs or get from state if not provided
            const historyRecs = historyRecsParam || state.recommendedMovies.basedOnHistory;
            const genreRecs = genreRecsParam || state.recommendedMovies.basedOnGenres;
            const actorRecs = actorRecsParam || state.recommendedMovies.basedOnActors;

            // Combine all recommendations
            const allRecommendations = [
                ...historyRecs,
                ...genreRecs,
                ...actorRecs
            ];

            // Remove duplicates
            const uniqueRecommendations = [];
            const seen = new Set();

            allRecommendations.forEach(movie => {
                if (!seen.has(movie.id)) {
                    seen.add(movie.id);
                    uniqueRecommendations.push(movie);
                }
            });

            // Get full details for top 10 movies to better calculate similarity
            const topMoviesPromises = uniqueRecommendations.slice(0, 20).map(async movie => {
                try {
                    const details = await fetchMovieDetails(movie.id);
                    return {
                        ...details,
                        recommendedBecause: movie.recommendedBecause
                    };
                } catch (error) {
                    console.error(`Error fetching details for movie ${movie.id}:`, error);
                    return movie;
                }
            });

            const moviesWithDetails = await Promise.all(topMoviesPromises);

            // Calculate similarity score for each movie
            const scoredMovies = moviesWithDetails.map(movie => ({
                ...movie,
                similarityScore: calculateMovieSimilarity(movie)
            }));

            // Sort by similarity score (highest first)
            const sortedRecommendations = scoredMovies
                .sort((a, b) => b.similarityScore - a.similarityScore)
                .slice(0, 10);

            dispatch({
                type: actions.SET_RECOMMENDED_MOVIES,
                payload: {
                    category: 'topPicks',
                    movies: sortedRecommendations
                }
            });

            dispatch({ type: actions.SET_LOADING, payload: false });
            return sortedRecommendations;
        } catch (error) {
            console.error('Error getting personalized top picks:', error);
            dispatch({ type: actions.SET_ERROR, payload: 'Failed to get top picks' });
            dispatch({ type: actions.SET_LOADING, payload: false });
            return [];
        }
    }, [
        state.recommendedMovies,
        // Removed these three dependencies to fix the circular reference:
        // getRecommendationsBasedOnWatchHistory,
        // getRecommendationsBasedOnGenres,
        // getRecommendationsBasedOnActors,
        calculateMovieSimilarity
    ]);

    // Store the personalized top picks function in the ref
    useEffect(() => {
        getPersonalizedTopPicksRef.current = getPersonalizedTopPicks;
    }, [getPersonalizedTopPicks]);

    // Load all recommendations
    // FIX: Use refs instead of direct function calls
    const loadAllRecommendations = useCallback(async () => {
        dispatch({ type: actions.SET_LOADING, payload: true });
        try {
            // Use the refs instead of direct function calls
            const historyRecs = await getHistoryRecommendationsRef.current();
            const genreRecs = await getGenreRecommendationsRef.current();
            const actorRecs = await getActorRecommendationsRef.current();

            // Only calculate top picks after the other recommendations are loaded
            await getPersonalizedTopPicksRef.current(historyRecs, genreRecs, actorRecs);

            dispatch({ type: actions.SET_LOADING, payload: false });
        } catch (error) {
            console.error('Error loading recommendations:', error);
            dispatch({ type: actions.SET_ERROR, payload: 'Failed to load recommendations' });
            dispatch({ type: actions.SET_LOADING, payload: false });
        }
    }, []); // No dependencies needed since we're using refs

    return (
        <RecommendationContext.Provider
            value={{
                ...state,
                addToWatchHistory,
                rateMovie,
                getRecommendationsBasedOnWatchHistory,
                getRecommendationsBasedOnGenres,
                getRecommendationsBasedOnActors,
                getPersonalizedTopPicks,
                loadAllRecommendations,
                calculateMovieSimilarity
            }}
        >
            {children}
        </RecommendationContext.Provider>
    );
};

export const useRecommendation = () => {
    const context = useContext(RecommendationContext);
    if (!context) {
        throw new Error('useRecommendation must be used within a RecommendationProvider');
    }
    return context;
};