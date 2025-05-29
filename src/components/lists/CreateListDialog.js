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
  FormControlLabel,
  Switch,
  FormHelperText,
  Divider
} from '@mui/material';
import {
  Movie,
  Public,
  Lock,
  Group,
  Tag
} from '@mui/icons-material';
import { listApi } from '../../api/listApi';

const CreateListDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: [],
    isPublic: true,
    isCollaborative: false
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'watchlist', label: 'Watchlist', description: 'Movies you want to watch' },
    { value: 'favorites', label: 'Favorites', description: 'Your favorite movies' },
    { value: 'themed', label: 'Themed', description: 'Movies grouped by theme' },
    { value: 'ranking', label: 'Ranking', description: 'Ordered list of movies' },
    { value: 'custom', label: 'Custom', description: 'Any other type of list' }
  ];

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(tag) && formData.tags.length < 5) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await listApi.createList(formData);
      
      if (response.success) {
        onSuccess(response.data);
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: 'custom',
          tags: [],
          isPublic: true,
          isCollaborative: false
        });
        setTagInput('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.name.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Movie />
        Create New List
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          name="name"
          label="List Name"
          fullWidth
          required
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: 100 }}
          helperText={`${formData.name.length}/100 characters`}
        />

        <TextField
          name="description"
          label="Description (optional)"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: 500 }}
          helperText={`${formData.description.length}/500 characters`}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="Category"
            disabled={loading}
          >
            {categories.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                <Box>
                  <Typography variant="body2">{cat.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cat.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Add tags (press Enter)"
          fullWidth
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={handleAddTag}
          margin="normal"
          disabled={loading || formData.tags.length >= 5}
          helperText="Add up to 5 tags to help others discover your list"
          InputProps={{
            startAdornment: <Tag sx={{ mr: 1, color: 'action.active' }} />
          }}
        />

        {formData.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, mb: 2 }}>
            {formData.tags.map(tag => (
              <Chip
                key={tag}
                label={`#${tag}`}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
                disabled={loading}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Privacy & Collaboration
        </Typography>

        <FormControlLabel
          control={
            <Switch
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              disabled={loading}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {formData.isPublic ? <Public /> : <Lock />}
              {formData.isPublic ? 'Public List' : 'Private List'}
            </Box>
          }
        />
        <FormHelperText sx={{ ml: 2 }}>
          {formData.isPublic
            ? 'Anyone can view and follow this list'
            : 'Only you can view this list'}
        </FormHelperText>

        <FormControlLabel
          control={
            <Switch
              name="isCollaborative"
              checked={formData.isCollaborative}
              onChange={handleChange}
              disabled={loading}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group />
              Collaborative List
            </Box>
          }
          sx={{ mt: 1 }}
        />
        <FormHelperText sx={{ ml: 2 }}>
          {formData.isCollaborative
            ? 'Other users can suggest movies to add'
            : 'Only you can add movies to this list'}
        </FormHelperText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create List'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateListDialog;