/**
 * MUI Icon Constants for KSL Learning Platform
 * Maps semantic icon names to MUI icon components
 */

import SignLanguageIcon from '@mui/icons-material/TouchApp';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TurtleIcon from '@mui/icons-material/Pets';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StarIcon from '@mui/icons-material/Star';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorCircleIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export const ICON_MAP = {
  // Learning tracks
  'sign-language': SignLanguageIcon,
  'finger-spelling': TextFieldsIcon,

  // Gamification
  'streak': LocalFireDepartmentIcon,
  'xp': StarIcon,
  'badge': EmojiEventsIcon,
  'turtle-mode': TurtleIcon,

  // Lesson/Quiz
  'book': BookIcon,
  'school': SchoolIcon,
  'correct': CheckCircleIcon,
  'try-again': ThumbsUpDownIcon,
  'video': VideocamIcon,
  'camera': CameraAltIcon,

  // Status/Feedback
  'success': CheckCircleIcon,
  'error': ErrorCircleIcon,
  'warning': WarningIcon,
  'info': InfoIcon,

  // Dictionary
  'dictionary': MenuBookIcon,
} as const;

export type IconKey = keyof typeof ICON_MAP;

/**
 * Get MUI Icon component by key
 * @param iconKey - Key from ICON_MAP
 * @returns MUI Icon component
 */
export function getIcon(iconKey: IconKey) {
  return ICON_MAP[iconKey];
}
