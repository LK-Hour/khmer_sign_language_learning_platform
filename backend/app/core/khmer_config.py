from app.core.config import settings


class KhmerConfig:
    """Khmer spelling configuration."""
    
    # Letter sets
    CONSONANTS = ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច', 'ឆ', 'ជ', 'ឈ', 'ញ',
                  'ដ', 'ឋ', 'ឌ', 'ឍ', 'ណ', 'ត', 'ថ', 'ទ', 'ធ', 'ន',
                  'ប', 'ផ', 'ព', 'ភ', 'ម', 'យ', 'រ', 'ល', 'វ', 'ស',
                  'ហ', 'ឡ', 'អ']
    
    Independent_VOWELS = ['អ','អា','ឥ', 'ឦ', 'ឧ', 'ឩ', 'ឫ', 'ឬ', 'ឭ', 'ឮ', 'ឯ', 'ឰ', 'ឱ', 'ឳ']

    Khmer_Numbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
    
    VOWELS = ['ា', 'ិ', 'ី', 'ឹ', 'ុ', 'ូ', 'ួ', 'ើ', 'ឺ', 'ើ', 'ឿ','ៀ','េ','ែ', 'ៃ', 'ោ', 'ៅ','ុះ', 'ំ', 'ះ', 'េះ','ោះ','៍', '៎', '៏', '័', '។', '៕', '៖', 'ៗ', '៘', '៙', '៚','question','!']
    
    
    # Scoring
    MIN_CONFIDENCE = 0.75
    PASS_THRESHOLD = 75.0
    GEM_THRESHOLD = 90.0
    
    # Model
    CLASSIFIER_PATH = getattr(settings, 'KHMER_CLASSIFIER_MODEL_PATH', 
                             'backend/models/khmer_classifier_v1.pth')
    
    # Dataset
    DATASET_BUCKET = getattr(settings, 'KHMER_DATASET_BUCKET',
                            'khmer-spelling-dataset')