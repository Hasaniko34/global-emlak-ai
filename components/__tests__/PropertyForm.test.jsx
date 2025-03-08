import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyForm from '../PropertyForm';
import axios from 'axios';

// axios'un mock edilmesi
jest.mock('axios');

describe('PropertyForm Bileşeni', () => {
  beforeEach(() => {
    // Her test öncesi axios mock'unu sıfırla
    jest.clearAllMocks();
  });

  test('form alanlarını doğru şekilde render eder', () => {
    render(<PropertyForm />);
    
    // Form alanlarının varlığını kontrol et
    expect(screen.getByTestId('property-form')).toBeInTheDocument();
    expect(screen.getByTestId('property-type-input')).toBeInTheDocument();
    expect(screen.getByTestId('location-input')).toBeInTheDocument();
    expect(screen.getByTestId('size-input')).toBeInTheDocument();
    expect(screen.getByTestId('rooms-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('form alanlarına veri girişi yapılabilir', () => {
    render(<PropertyForm />);
    
    // Form alanlarına veri gir
    fireEvent.change(screen.getByTestId('property-type-input'), { target: { value: 'Daire' } });
    fireEvent.change(screen.getByTestId('location-input'), { target: { value: 'İstanbul, Kadıköy' } });
    fireEvent.change(screen.getByTestId('size-input'), { target: { value: '120' } });
    fireEvent.change(screen.getByTestId('rooms-input'), { target: { value: '3' } });
    
    // Değerlerin doğru şekilde güncellendiğini kontrol et
    expect(screen.getByTestId('property-type-input')).toHaveValue('Daire');
    expect(screen.getByTestId('location-input')).toHaveValue('İstanbul, Kadıköy');
    expect(screen.getByTestId('size-input')).toHaveValue(120);
    expect(screen.getByTestId('rooms-input')).toHaveValue(3);
  });

  test('form gönderildiğinde API çağrısı yapar', async () => {
    // Mock API yanıtı
    const mockResponse = {
      data: {
        data: {
          propertyType: 'Daire',
          location: 'İstanbul, Kadıköy',
          size: 120,
          rooms: 3,
          estimatedValue: 2500000,
          estimatedRent: 12500
        }
      }
    };
    
    axios.post.mockResolvedValueOnce(mockResponse);
    
    const onResultMock = jest.fn();
    render(<PropertyForm onResult={onResultMock} />);
    
    // Form alanlarını doldur
    fireEvent.change(screen.getByTestId('property-type-input'), { target: { value: 'Daire' } });
    fireEvent.change(screen.getByTestId('location-input'), { target: { value: 'İstanbul, Kadıköy' } });
    fireEvent.change(screen.getByTestId('size-input'), { target: { value: '120' } });
    fireEvent.change(screen.getByTestId('rooms-input'), { target: { value: '3' } });
    
    // Formu gönder
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // API çağrısının yapıldığını kontrol et
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/evaluate', {
        propertyType: 'Daire',
        location: 'İstanbul, Kadıköy',
        size: 120,
        rooms: 3
      });
    });
    
    // onResult callback'inin çağrıldığını kontrol et
    await waitFor(() => {
      expect(onResultMock).toHaveBeenCalledWith(mockResponse.data.data);
    });
  });

  test('API hatası durumunda hata mesajı gösterir', async () => {
    // API hatasını simüle et
    axios.post.mockRejectedValueOnce(new Error('API Error'));
    
    render(<PropertyForm />);
    
    // Form alanlarını doldur ve gönder
    fireEvent.change(screen.getByTestId('property-type-input'), { target: { value: 'Daire' } });
    fireEvent.change(screen.getByTestId('location-input'), { target: { value: 'İstanbul, Kadıköy' } });
    fireEvent.change(screen.getByTestId('size-input'), { target: { value: '120' } });
    fireEvent.change(screen.getByTestId('rooms-input'), { target: { value: '3' } });
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Hata mesajının gösterildiğini kontrol et
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });
}); 