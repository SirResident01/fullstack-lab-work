import React from 'react';
import { CarWithOwner } from '@/types/api';
import { formatPrice } from '@/lib/utils';
import {
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CarCardProps {
  car: CarWithOwner;
  onEdit?: (car: CarWithOwner) => void;
  onDelete?: (car: CarWithOwner) => void;
  showActions?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({
  car,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography variant="h6" component="h3" fontWeight="bold">
                {car.brand} {car.model}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {car.registrationNumber}
            </Typography>

            <Stack direction="row" spacing={2} mb={2}>
              <Typography variant="body2" color="text.secondary">
                Год: {car.modelYear}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Цена: {formatPrice(car.price)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Владелец: {car.owner || 'Не назначен'}
              </Typography>
              <Chip label={car.color} size="small" color="primary" variant="outlined" />
            </Stack>
          </Box>

          {showActions && (onEdit || onDelete) && (
            <Stack direction="row" spacing={1} ml={2}>
              {onEdit && (
                <Tooltip title="Редактировать">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(car)}
                    color="primary"
                    aria-label="edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Удалить">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(car)}
                    color="error"
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CarCard;
