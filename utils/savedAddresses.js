// Kaydedilen adresler için yardımcı fonksiyonlar
// Bu dosya, kullanıcıların adreslerini kaydetmek ve yönetmek için API çağrıları yapar

/**
 * Kullanıcının kayıtlı adreslerini getirir
 * @returns {Promise<Array>} - Kaydedilmiş adreslerin listesi
 */
export const getSavedAddresses = async () => {
  try {
    const response = await fetch('/api/user/addresses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Adresler getirilirken bir hata oluştu');
    }
    
    const data = await response.json();
    return data.addresses || [];
  } catch (error) {
    console.error('Adresler yüklenirken hata:', error);
    return [];
  }
};

/**
 * Yeni bir adres kaydeder
 * @param {Object} addressData - Kaydedilecek adres bilgileri
 * @returns {Promise<Object>} - Kaydedilen adres bilgisi
 */
export const saveAddress = async (addressData) => {
  try {
    const response = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      throw new Error('Adres kaydedilirken bir hata oluştu');
    }
    
    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Adres kaydedilirken hata:', error);
    throw error;
  }
};

/**
 * Kaydedilmiş bir adresi siler
 * @param {string} addressId - Silinecek adresin ID'si
 * @returns {Promise<boolean>} - İşlem başarılı ise true
 */
export const deleteAddress = async (addressId) => {
  try {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Adres silinirken bir hata oluştu');
    }
    
    return true;
  } catch (error) {
    console.error('Adres silinirken hata:', error);
    return false;
  }
};

/**
 * Adrese özel isim verir (etiketleme)
 * @param {string} addressId - Adresi ID'si 
 * @param {string} label - Adresin yeni etiketi (örn: "Ev", "İş", "Yazlık")
 * @returns {Promise<Object>} - Güncellenmiş adres
 */
export const labelAddress = async (addressId, label) => {
  try {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label }),
    });
    
    if (!response.ok) {
      throw new Error('Adres güncellenirken bir hata oluştu');
    }
    
    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Adres etiketlenirken hata:', error);
    throw error;
  }
}; 