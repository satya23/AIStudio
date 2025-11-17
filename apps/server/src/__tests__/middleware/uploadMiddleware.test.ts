import { upload } from '../../middleware/uploadMiddleware';

describe('uploadMiddleware', () => {
  it('should export upload middleware', () => {
    expect(upload).toBeDefined();
    expect(typeof upload.single).toBe('function');
    expect(typeof upload.array).toBe('function');
    expect(typeof upload.fields).toBe('function');
  });

  it('should have single method for file upload', () => {
    const middleware = upload.single('image');
    expect(typeof middleware).toBe('function');
  });
});

