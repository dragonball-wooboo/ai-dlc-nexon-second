import { useState, useEffect } from 'react';
import type { Menu, MenuInput, Category } from '../api/client';
import { uploadImage } from '../api/client';

interface MenuFormProps {
  menu?: Menu;
  categories: Category[];
  onSubmit: (data: MenuInput) => void;
  onCancel: () => void;
}

export function MenuForm({ menu, categories, onSubmit, onCancel }: MenuFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setPrice(String(menu.price));
      setDescription(menu.description);
      setCategoryId(menu.categoryId);
      setImageUrl(menu.imageUrl);
    }
  }, [menu]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.length > 50) {
      newErrors.name = '메뉴명은 1~50자로 입력해주세요.';
    }

    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum < 100 || priceNum > 1000000 || !Number.isInteger(priceNum)) {
      newErrors.price = '가격은 100~1,000,000 사이 정수로 입력해주세요.';
    }

    if (description.length > 200) {
      newErrors.description = '설명은 200자 이내로 입력해주세요.';
    }

    if (!categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: '허용된 형식: jpg, png, gif, webp' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: '파일 크기는 5MB 이하여야 합니다.' }));
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setImageUrl(result.url);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    } catch {
      setErrors((prev) => ({ ...prev, image: '이미지 업로드에 실패했습니다.' }));
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      categoryId,
      imageUrl: imageUrl || undefined,
    });
  }

  return (
    <form className="menu-form" onSubmit={handleSubmit}>
      <h3 className="menu-form__title">{menu ? '메뉴 수정' : '메뉴 등록'}</h3>

      <div className="menu-form__field">
        <label htmlFor="menu-name">메뉴명 *</label>
        <input
          id="menu-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="메뉴명을 입력하세요"
        />
        {errors.name && <span className="menu-form__error">{errors.name}</span>}
      </div>

      <div className="menu-form__field">
        <label htmlFor="menu-price">가격 (원) *</label>
        <input
          id="menu-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min={100}
          max={1000000}
          placeholder="가격을 입력하세요"
        />
        {errors.price && <span className="menu-form__error">{errors.price}</span>}
      </div>

      <div className="menu-form__field">
        <label htmlFor="menu-description">설명</label>
        <textarea
          id="menu-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          placeholder="메뉴 설명 (선택)"
          rows={3}
        />
        {errors.description && <span className="menu-form__error">{errors.description}</span>}
      </div>

      <div className="menu-form__field">
        <label htmlFor="menu-category">카테고리 *</label>
        <select
          id="menu-category"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value={0}>카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <span className="menu-form__error">{errors.categoryId}</span>}
      </div>

      <div className="menu-form__field">
        <label htmlFor="menu-image">이미지</label>
        <input
          id="menu-image"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {uploading && <span className="menu-form__uploading">업로드 중...</span>}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="메뉴 미리보기"
            className="menu-form__preview"
          />
        )}
        {errors.image && <span className="menu-form__error">{errors.image}</span>}
      </div>

      <div className="menu-form__actions">
        <button type="submit" className="btn btn--primary" disabled={uploading}>
          {menu ? '수정' : '등록'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}
