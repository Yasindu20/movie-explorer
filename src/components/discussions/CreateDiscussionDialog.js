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
  FormHelperText
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const CreateDiscussionDialog = ({ open, onClose, onSubmit, movieTitle }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'review', label: 'Review' },
    { value: 'theory', label: 'Theory/Analysis' },
    { value: 'spoiler', label: 'Spoiler Discussion' },
    { value: 'question', label: 'Question' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: []
      });
      setTagInput('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.title.trim() && formData.content.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>
        Start a Discussion
        <Typography variant="body2" color="text.secondary">
          About: {movieTitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          name="title"
          label="Discussion Title"
          fullWidth
          required
          value={formData.title}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
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
            disabled={loading}
          >
            {categories.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
                {cat.value === 'spoiler' && (
                  <Warning sx={{ ml: 1, fontSize: 18, color: 'error.main' }} />
                )}
              </MenuItem>
            ))}
          </Select>
          {formData.category === 'spoiler' && (
            <FormHelperText error>
              This discussion will be marked with spoiler warnings
            </FormHelperText>
          )}
        </FormControl>

        <TextField
          name="content"
          label="Your thoughts..."
          fullWidth
          required
          multiline
          rows={6}
          value={formData.content}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
          inputProps={{ maxLength: 5000 }}
          helperText={`${formData.content.length}/5000 characters`}
        />

        <TextField
          label="Add tags (press Enter)"
          fullWidth
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={handleAddTag}
          margin="normal"
          disabled={loading || formData.tags.length >= 5}
          helperText="Add up to 5 tags to help others find your discussion"
        />

        {formData.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
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
          {loading ? <CircularProgress size={24} /> : 'Create Discussion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDiscussionDialog;