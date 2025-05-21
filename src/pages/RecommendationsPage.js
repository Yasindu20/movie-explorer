import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Skeleton,
  Alert,
  Rating,
  useTheme,
  useMediaQuery,
  Grow,
  Zoom,
  alpha
} from '@mui/material';
import {
  Recommend,
  History,
  MovieFilter,
  Theaters,
  Favorite,
  Person,
  Star,
  StarBorder,
  AutoAwesome,
  PlayArrow,
  Timeline,
  RefreshRounded,
  InsightsRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';
import { getImageUrl } from '../api/tmdbApi';
import MovieCard from '../components/MovieCard';
import RatingSystem from '../components/RatingSystem';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recommendation-tabpanel-${index}`}
      aria-labelledby={`recommendation-tab-${index}`}
      {...other}
      style={{ minHeight: 500 }}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Movie recommendation section with horizontal scrolling
const RecommendationSection = ({ title, icon, movies, loading, error, emptyMessage, onRefresh }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
              <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" height={isSmallScreen ? 150 : 220} width="100%" animation="wave" />
                <Box sx={{ p: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (movies.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              {title}
            </Typography>
          </Box>
          {onRefresh && (
            <Button 
              startIcon={<RefreshRounded />} 
              size="small" 
              onClick={onRefresh}
              variant="outlined"
            >
              Refresh
            </Button>
          )}
        </Box>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            borderRadius: 2
          }}
        >
          <Typography align="center" color="text.secondary">
            {emptyMessage || "No recommendations available yet."}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        {onRefresh && (
          <Button 
            startIcon={<RefreshRounded />} 
            size="small" 
            onClick={onRefresh}
            variant="outlined"
          >
            Refresh
          </Button>
        )}
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          pb: 2,
          pt: 1,
          px: 0.5,
          gap: 2,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 4,
          }
        }}
      >
        {movies.map((movie, index) => (
          <Grow
            key={movie.id}
            in={true}
            style={{ transformOrigin: '0 0 0' }}
            timeout={(index + 1) * 200}
          >
            <Card 
              sx={{ 
                minWidth: { xs: 160, sm: 200, md: 220 }, 
                maxWidth: { xs: 160, sm: 200, md: 220 },
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
            >
              <CardActionArea onClick={() => navigate(`/movie/${movie.id}`)}>
                <CardMedia
                  component="img"
                  height={isSmallScreen ? 240 : 300}
                  image={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                />
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight="bold" noWrap title={movie.title}>
                    {movie.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 1 }}>
                    <Star sx={{ color: 'gold', fontSize: '0.9rem', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {movie.vote_average?.toFixed(1) || 'N/A'}/10
                    </Typography>
                  </Box>
                  
                  {movie.recommendedBecause && (
                    <Box sx={{ mt: 1 }}>
                      {movie.recommendedBecause.movieTitle && (
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                          Because you watched:
                          <Chip 
                            label={movie.recommendedBecause.movieTitle} 
                            size="small" 
                            sx={{ mt: 0.5, maxWidth: '100%' }}
                          />
                        </Typography>
                      )}
                      
                      {movie.recommendedBecause.genres && (
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                          Matches your genres:
                          <Chip 
                            label={movie.recommendedBecause.genres} 
                            size="small" 
                            sx={{ mt: 0.5, maxWidth: '100%' }}
                          />
                        </Typography>
                      )}
                      
                      {movie.recommendedBecause.actor && (
                        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                          Features:
                          <Chip 
                            label={movie.recommendedBecause.actor} 
                            size="small" 
                            sx={{ mt: 0.5, maxWidth: '100%' }}
                          />
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {/* Similar to your taste indicator - only for top picks */}
                  {movie.similarityScore !== undefined && (
                    <Box 
                      sx={{ 
                        mt: 0.5, 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        opacity: 0.7
                      }}
                    >
                      <InsightsRounded fontSize="small" color="primary" />
                      <Typography variant="caption" color="primary.main">
                        {movie.similarityScore > 3 
                          ? 'Strong match' 
                          : movie.similarityScore > 1.5 
                            ? 'Good match' 
                            : 'Moderate match'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
              
              {/* Rating component */}
              <Box sx={{ p: 1, pt: 0 }}>
                <RatingSystem movieId={movie.id} size="small" showLabel={false} />
              </Box>
            </Card>
          </Grow>
        ))}
      </Box>
    </Box>
  );
};

// Watch history section
const WatchHistorySection = ({ watchHistory, loading }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1 }} />
          Watch History
        </Typography>
        <Grid container spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={100} width="100%" animation="wave" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (watchHistory.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1 }} />
          Watch History
        </Typography>
        <Alert severity="info">
          Your watch history is empty. Movies you view will appear here.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <History sx={{ mr: 1 }} />
        Watch History
      </Typography>
      <Box 
        sx={{ 
          maxHeight: 400, 
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 4,
          }
        }}
      >
        {watchHistory.slice(0, 10).map((movie, index) => (
          <Zoom
            key={movie.id}
            in={true}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateX(5px)'
                },
                transition: 'all 0.2s ease'
              }}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <Box
                component="img"
                src={getImageUrl(movie.poster_path, 'w92')}
                alt={movie.title}
                sx={{
                  width: 60,
                  height: 90,
                  borderRadius: 1,
                  mr: 2,
                  objectFit: 'cover',
                  boxShadow: 1
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {movie.genres?.slice(0, isSmallScreen ? 1 : 3).map(genre => (
                    <Chip key={genre.id} label={genre.name} size="small" />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Watched: {new Date(movie.lastWatchedAt).toLocaleDateString()}
                  </Typography>
                  {movie.director && (
                    <Typography variant="caption" color="text.secondary">
                      Director: {movie.director}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box>
                <RatingSystem movieId={movie.id} size="small" labelPosition="left" />
              </Box>
            </Paper>
          </Zoom>
        ))}
      </Box>
    </Box>
  );
};

// Preference insights section
const PreferenceInsights = ({ favoriteGenres, favoriteActors, favoriteDirectors }) => {
  const theme = useTheme();
  
  // Get top 5 genres
  const topGenres = Object.values(favoriteGenres)
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 5);
    
  // Get top 3 actors
  const topActors = Object.values(favoriteActors)
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 3);
    
  // Get top 3 directors
  const topDirectors = Object.values(favoriteDirectors)
    .sort((a, b) => b.normalizedScore - a.normalizedScore)
    .slice(0, 3);
  
  // If no preferences yet
  if (topGenres.length === 0 && topActors.length === 0 && topDirectors.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <InsightsRounded sx={{ mr: 1 }} />
          Your Preference Insights
        </Typography>
        <Alert severity="info">
          As you watch and rate more movies, we'll build a profile of your preferences to improve recommendations.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <InsightsRounded sx={{ mr: 1 }} />
        Your Preference Insights
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a237e 0%, #311b92 100%)' 
            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
        }}
      >
        {topGenres.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MovieFilter sx={{ mr: 1, opacity: 0.7 }} />
              Your Top Genres
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {topGenres.map(genre => (
                <Chip 
                  key={genre.id} 
                  label={genre.name} 
                  color="primary" 
                  variant={genre.normalizedScore > 70 ? "filled" : "outlined"}
                  sx={{ 
                    fontWeight: genre.normalizedScore > 70 ? 'bold' : 'normal',
                    opacity: genre.normalizedScore / 100 + 0.3
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {topActors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, opacity: 0.7 }} />
              Your Favorite Actors
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {topActors.map(actor => (
                <Chip 
                  key={actor.id} 
                  label={actor.name} 
                  color="secondary" 
                  variant={actor.normalizedScore > 70 ? "filled" : "outlined"}
                  sx={{ 
                    fontWeight: actor.normalizedScore > 70 ? 'bold' : 'normal',
                    opacity: actor.normalizedScore / 100 + 0.3
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {topDirectors.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MovieFilter sx={{ mr: 1, opacity: 0.7 }} />
              Your Favorite Directors
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {topDirectors.map(director => (
                <Chip 
                  key={director.id} 
                  label={director.name} 
                  color="success" 
                  variant={director.normalizedScore > 70 ? "filled" : "outlined"}
                  sx={{ 
                    fontWeight: director.normalizedScore > 70 ? 'bold' : 'normal',
                    opacity: director.normalizedScore / 100 + 0.3
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    watchHistory,
    userRatings,
    recommendedMovies,
    favoriteGenres,
    favoriteActors,
    favoriteDirectors,
    isLoading,
    error,
    loadAllRecommendations,
    getRecommendationsBasedOnWatchHistory,
    getRecommendationsBasedOnGenres,
    getRecommendationsBasedOnActors,
    getPersonalizedTopPicks
  } = useRecommendation();

  // Load recommendations on component mount
  useEffect(() => {
    loadAllRecommendations();
  }, [loadAllRecommendations]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Recommend sx={{ mr: 1 }} />
          Your Personalized Recommendations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover movies tailored to your taste based on your viewing history, ratings, and preferences.
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isSmallScreen ? "scrollable" : "fullWidth"}
            scrollButtons={isSmallScreen ? "auto" : false}
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 'auto', sm: 160 },
                py: 2
              }
            }}
          >
            <Tab 
              label="For You" 
              icon={<AutoAwesome />} 
              iconPosition="start"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab 
              label="Based on History" 
              icon={<Timeline />}
              iconPosition="start"
            />
            <Tab 
              label="Watch History" 
              icon={<History />}
              iconPosition="start"
            />
            <Tab 
              label="Insights" 
              icon={<InsightsRounded />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* For You Tab */}
        <TabPanel value={tabValue} index={0}>
          <RecommendationSection
            title="Top Picks For You"
            icon={<AutoAwesome color="primary" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.topPicks}
            loading={isLoading}
            error={error}
            emptyMessage="Watch and rate more movies to get personalized recommendations."
            onRefresh={getPersonalizedTopPicks}
          />
          
          <RecommendationSection
            title="Based on Your Favorite Genres"
            icon={<MovieFilter color="secondary" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.basedOnGenres}
            loading={isLoading}
            error={error}
            onRefresh={getRecommendationsBasedOnGenres}
          />
          
          <RecommendationSection
            title="Because You Watched"
            icon={<Theaters color="error" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.basedOnHistory}
            loading={isLoading}
            error={error}
            onRefresh={getRecommendationsBasedOnWatchHistory}
          />
          
          <RecommendationSection
            title="Featuring Your Favorite Actors"
            icon={<Person color="info" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.basedOnActors}
            loading={isLoading}
            error={error}
            onRefresh={getRecommendationsBasedOnActors}
          />
        </TabPanel>

        {/* Based on History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Timeline sx={{ mr: 1 }} color="primary" />
              How Recommendations Work
            </Typography>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="body1" paragraph>
                Our recommendation engine analyzes your viewing history, ratings, and preferences to suggest movies you're likely to enjoy.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <History color="primary" sx={{ fontSize: '2.5rem', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Watch History
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Movies you've viewed are analyzed for patterns in genres, actors, and directors.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Star color="primary" sx={{ fontSize: '2.5rem', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Your Ratings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rating movies helps us understand what you like and dislike.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Favorite color="primary" sx={{ fontSize: '2.5rem', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Favorites
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Movies you favorite are given special weight in our algorithm.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <RecommendationSection
            title="Because You Watched"
            icon={<Theaters color="error" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.basedOnHistory}
            loading={isLoading}
            error={error}
            emptyMessage="Movies similar to those you've watched will appear here."
            onRefresh={getRecommendationsBasedOnWatchHistory}
          />
          
          <RecommendationSection
            title="Based on Your Favorite Genres"
            icon={<MovieFilter color="secondary" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.basedOnGenres}
            loading={isLoading}
            error={error}
            emptyMessage="Watch more movies to get genre-based recommendations."
            onRefresh={getRecommendationsBasedOnGenres}
          />
          
          <RecommendationSection
            title="Featuring Your Favorite Actors"
            icon={<Person color="info" sx={{ fontSize: '1.8rem' }} />}
            movies={recommendedMovies.basedOnActors}
            loading={isLoading}
            error={error}
            emptyMessage="Watch more movies to discover your favorite actors."
            onRefresh={getRecommendationsBasedOnActors}
          />
        </TabPanel>

        {/* Watch History Tab */}
        <TabPanel value={tabValue} index={2}>
          <WatchHistorySection watchHistory={watchHistory} loading={isLoading} />
          
          {watchHistory.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Recommend />}
                onClick={() => setTabValue(0)}
                sx={{ mr: 2 }}
              >
                View Your Recommendations
              </Button>
              <Button
                variant="outlined"
                startIcon={<Theaters />}
                onClick={() => navigate('/')}
              >
                Browse More Movies
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Insights Tab */}
        <TabPanel value={tabValue} index={3}>
          <PreferenceInsights 
            favoriteGenres={favoriteGenres} 
            favoriteActors={favoriteActors} 
            favoriteDirectors={favoriteDirectors} 
          />
          
          {Object.keys(userRatings).length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Star sx={{ mr: 1 }} />
                Your Movie Ratings
              </Typography>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body2" paragraph>
                  You've rated {Object.keys(userRatings).length} movies. 
                  Here's a breakdown of your ratings:
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = Object.values(userRatings).filter(
                      r => Math.floor(r.rating) === rating
                    ).length;
                    
                    const percentage = 
                      Object.keys(userRatings).length > 0 
                        ? (count / Object.keys(userRatings).length) * 100 
                        : 0;
                    
                    return (
                      <Grid item xs={12} sm={6} md={2.4} key={rating}>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            borderRadius: 2,
                            background: rating >= 4 
                              ? alpha(theme.palette.success.main, 0.1)
                              : rating === 3 
                                ? alpha(theme.palette.info.main, 0.1)
                                : alpha(theme.palette.error.main, 0.1)
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <Rating 
                              value={rating} 
                              readOnly 
                              size="small"
                              icon={<Star fontSize="inherit" sx={{ color: 'gold' }} />}
                              emptyIcon={<StarBorder fontSize="inherit" />}
                            />
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {percentage.toFixed(1)}% of ratings
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<Recommend />}
                    onClick={() => setTabValue(0)}
                  >
                    See Your Recommendations
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};

export default RecommendationsPage;