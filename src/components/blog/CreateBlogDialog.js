import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Autocomplete,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import {
  Close,
  Movie,
  Image,
  Send,
  Save
} from '@mui/icons-material';
import { blogApi } from '../../api/blogApi';
import { searchMovies } from '../../api/tmdbApi';

const CreateBlogDialog = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'review',
    relatedMovies: [],
    tags: [],
    status: 'draft',
    featuredImage: ''
  });
  const [movieSearch, setMovieSearch] = useState('');
  const [movieOptions, setMovieOptions] = useState([]);
  const [searchingMovies, setSearchingMovies] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const steps = ['Basic Info', 'Content', 'Movies & Tags', 'Review & Publish'];

  const categories = [
    { value: 'review', label: 'Movie Review' },
    { value: 'news', label: 'Movie News' },
    { value: 'analysis', label: 'Film Analysis' },
    { value: 'list', label: 'Movie List' },
    { value: 'opinion', label: 'Opinion Piece' },
    { value: 'interview', label: 'Interview' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate excerpt from content
    if (name === 'content' && !formData.excerpt) {
      const excerpt = value.substring(0, 297) + (value.length > 297 ? '...' : '');
      setFormData(prev => ({
        ...prev,
        excerpt
      }));
    }
  };

  const handleMovieSearch = async (searchTerm) => {
    if (!searchTerm) return;

    setSearchingMovies(true);
    try {
      const results = await searchMovies(searchTerm);
      setMovieOptions(results.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setSearchingMovies(false);
    }
  };

  const handleAddMovie = (movie) => {
    if (!movie || formData.relatedMovies.some(m => m.movieId === movie.id)) return;

    setFormData(prev => ({
      ...prev,
      relatedMovies: [...prev.relatedMovies, {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path
      }]
    }));
  };

  const handleRemoveMovie = (movieId) => {
    setFormData(prev => ({
      ...prev,
      relatedMovies: prev.relatedMovies.filter(m => m.movieId !== movieId)
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(tag) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (status = 'draft') => {
    setError(null);
    setLoading(true);

    try {
      const response = await blogApi.createBlog({
        ...formData,
        status
      });

      if (response.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.title.trim() && formData.category;
      case 1:
        return formData.content.trim() && formData.content.length >= 100;
      case 2:
        return true; // Optional step
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <TextField
              name="title"
              label="Blog Title"
              fullWidth
              required
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.title.length}/200 characters`}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="featuredImage"
              label="Featured Image URL (optional)"
              fullWidth
              value={formData.featuredImage}
              onChange={handleChange}
              margin="normal"
              helperText="Provide a URL for the featured image"
              InputProps={{
                startAdornment: <Image sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preview}
                    onChange={(e) => setPreview(e.target.checked)}
                  />
                }
                label="Preview"
              />
            </Box>

            {preview ? (
              <Paper elevation={1} sx={{ p: 3, minHeight: 400 }}>
                <Typography variant="h4" gutterBottom>
                  {formData.title || 'Untitled'}
                </Typography>
                <Typography variant="body1" paragraph>
                  {formData.content || 'Start writing your blog post...'}
                </Typography>
              </Paper>
            ) : (
              <>
                <TextField
                  name="content"
                  label="Blog Content"
                  fullWidth
                  required
                  multiline
                  rows={15}
                  value={formData.content}
                  onChange={handleChange}
                  margin="normal"
                  helperText={`Minimum 100 characters. ${formData.content.length} characters written.`}
                  error={formData.content.length > 0 && formData.content.length < 100}
                />

                <TextField
                  name="excerpt"
                  label="Excerpt (auto-generated or custom)"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ maxLength: 300 }}
                  helperText="Brief summary shown in blog list"
                />
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Related Movies
            </Typography>
            <Autocomplete
              options={movieOptions}
              getOptionLabel={(option) => `${option.title} (${option.release_date?.split('-')[0] || 'N/A'})`}
              loading={searchingMovies}
              onInputChange={(event, value) => {
                setMovieSearch(value);
                if (value) handleMovieSearch(value);
              }}
              onChange={(event, value) => {
                if (value) handleAddMovie(value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search and add related movies"
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Movie sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              )}
            />

            {formData.relatedMovies.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.relatedMovies.map(movie => (
                  <Chip
                    key={movie.movieId}
                    label={movie.movieTitle}
                    onDelete={() => handleRemoveMovie(movie.movieId)}
                  />
                ))}
              </Box>
            )}

            <TextField
              label="Add tags (press Enter)"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleAddTag}
              margin="normal"
              disabled={formData.tags.length >= 10}
              helperText="Add up to 10 tags to help readers find your post"
              sx={{ mt: 3 }}
            />

            {formData.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {formData.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Review your blog post before publishing. You can save as draft or publish immediately.
            </Alert>

            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {formData.title}
              </Typography>
              
              <Chip
                label={categories.find(c => c.value === formData.category)?.label}
                size="small"
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" paragraph>
                {formData.excerpt}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Content Length: {formData.content.length} characters
                </Typography>
                
                {formData.relatedMovies.length > 0 && (
                  <Typography variant="subtitle2" gutterBottom>
                    Related Movies: {formData.relatedMovies.length}
                  </Typography>
                )}
                
                {formData.tags.length > 0 && (
                  <Typography variant="subtitle2" gutterBottom>
                    Tags: {formData.tags.join(', ')}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Create Blog Post</Typography>
        <IconButton onClick={onClose} edge="end">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        >
          Back
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />

        {activeStep === steps.length - 1 ? (
          <>
            <Button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              startIcon={<Save />}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit('published')}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            >
              Publish
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateBlogDialog;