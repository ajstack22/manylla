/**
 * @jest-environment jsdom
 */
import { Alert, Platform } from "react-native";
import { ImagePicker } from "../ImagePicker";
import { validateImage, IMAGE_CONFIG } from "../../../utils/imageUtils";
import platform from "../../../utils/platform";

// Mock dependencies
jest.mock("../../../utils/imageUtils", () => ({
  validateImage: jest.fn(),
  IMAGE_CONFIG: {
    MAX_DIMENSION: 800,
    JPEG_QUALITY: 0.85,
    MAX_FILE_SIZE: 2 * 1024 * 1024,
    ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png"],
    ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png"],
  },
}));

jest.mock("../../../utils/platform", () => ({
  isWeb: true,
  isMobile: false,
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: "web",
  },
}));

// Mock react-native-image-picker module
jest.mock("react-native-image-picker", () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock DOM APIs for web tests
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: "data:image/jpeg;base64,mockbase64data",
  onloadend: null,
  onerror: null,
};

const mockFile = {
  type: "image/jpeg",
  size: 1024 * 1024, // 1MB
  name: "test.jpg",
};

const mockInputElement = {
  type: "",
  accept: "",
  multiple: false,
  onchange: null,
  oncancel: null,
  click: jest.fn(),
  files: [mockFile],
};

// Setup DOM mocks
beforeEach(() => {
  jest.clearAllMocks();

  // Mock document.createElement
  global.document.createElement = jest.fn((tag) => {
    if (tag === "input") {
      return mockInputElement;
    }
    return {};
  });

  // Mock FileReader
  global.FileReader = jest.fn(() => mockFileReader);

  // Mock validation to pass by default
  validateImage.mockReturnValue({ isValid: true });

  // Reset platform to web
  platform.isWeb = true;
  platform.isMobile = false;
});

describe("ImagePicker", () => {
  describe("Web Platform Tests", () => {
    beforeEach(() => {
      platform.isWeb = true;
      platform.isMobile = false;
    });

    describe("selectImage", () => {
      it("should create file input with correct attributes", async () => {
        const promise = ImagePicker.selectImage();

        expect(document.createElement).toHaveBeenCalledWith("input");
        expect(mockInputElement.type).toBe("file");
        expect(mockInputElement.accept).toBe(IMAGE_CONFIG.ALLOWED_TYPES.join(","));
        expect(mockInputElement.multiple).toBe(false);
      });

      it("should handle successful file selection", async () => {
        const promise = ImagePicker.selectImage();

        // Simulate file selection
        const event = { target: { files: [mockFile] } };
        mockInputElement.onchange(event);

        // Simulate FileReader success
        setTimeout(() => {
          mockFileReader.onloadend();
        }, 0);

        const result = await promise;

        expect(validateImage).toHaveBeenCalledWith(mockFile);
        expect(result).toEqual({
          cancelled: false,
          dataUrl: mockFileReader.result,
          file: mockFile,
          type: mockFile.type,
          size: mockFile.size,
          name: mockFile.name,
          source: "web-file-picker",
        });
      });

      it("should handle cancelled file selection", async () => {
        const promise = ImagePicker.selectImage();

        // Simulate no file selected
        const event = { target: { files: [] } };
        mockInputElement.onchange(event);

        const result = await promise;
        expect(result).toEqual({ cancelled: true });
      });

      it("should handle file validation errors", async () => {
        validateImage.mockReturnValue({
          isValid: false,
          error: "File too large",
        });

        const promise = ImagePicker.selectImage();

        // Simulate file selection
        const event = { target: { files: [mockFile] } };
        mockInputElement.onchange(event);

        await expect(promise).rejects.toThrow("File too large");
      });

      it("should handle FileReader errors", async () => {
        const promise = ImagePicker.selectImage();

        // Simulate file selection
        const event = { target: { files: [mockFile] } };
        mockInputElement.onchange(event);

        // Simulate FileReader error
        setTimeout(() => {
          mockFileReader.onerror();
        }, 0);

        await expect(promise).rejects.toThrow("Failed to read selected file");
      });

      it("should handle cancel event", async () => {
        const promise = ImagePicker.selectImage();

        // Simulate cancel
        mockInputElement.oncancel();

        const result = await promise;
        expect(result).toEqual({ cancelled: true });
      });

      it("should pass custom options", async () => {
        const customOptions = {
          accept: "image/png",
          multiple: true,
        };

        ImagePicker.selectImage(customOptions);

        expect(mockInputElement.accept).toBe("image/png");
        expect(mockInputElement.multiple).toBe(true);
      });
    });

    describe("capturePhoto", () => {
      it("should reject on web platform", async () => {
        await expect(ImagePicker.capturePhoto()).rejects.toThrow(
          "Camera capture only available on mobile devices"
        );
      });
    });

    describe("showImagePicker", () => {
      it("should call _selectImageWeb on web platform", async () => {
        const spy = jest.spyOn(ImagePicker, "_selectImageWeb").mockResolvedValue({ cancelled: true });

        await ImagePicker.showImagePicker();

        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });
  });

  describe("Mobile Platform Tests", () => {
    const mockImagePicker = {
      launchCamera: jest.fn(),
      launchImageLibrary: jest.fn(),
    };

    beforeEach(() => {
      platform.isWeb = false;
      platform.isMobile = true;

      // Mock require for react-native-image-picker
      jest.doMock("react-native-image-picker", () => mockImagePicker);
    });

    describe("selectImage", () => {
      it("should call _selectImageMobile with gallery source", async () => {
        const spy = jest.spyOn(ImagePicker, "_selectImageMobile").mockResolvedValue({ cancelled: true });

        await ImagePicker.selectImage();

        expect(spy).toHaveBeenCalledWith("gallery", {});
        spy.mockRestore();
      });
    });

    describe("capturePhoto", () => {
      it("should call _selectImageMobile with camera source", async () => {
        const spy = jest.spyOn(ImagePicker, "_selectImageMobile").mockResolvedValue({ cancelled: true });

        await ImagePicker.capturePhoto();

        expect(spy).toHaveBeenCalledWith("camera", {});
        spy.mockRestore();
      });
    });

    describe("showImagePicker", () => {
      it("should show mobile dialog with options", async () => {
        const spy = jest.spyOn(ImagePicker, "_showMobileDialog").mockResolvedValue({ cancelled: true });

        await ImagePicker.showImagePicker();

        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe("_showMobileDialog", () => {
      it("should show Alert with correct options", async () => {
        const promise = ImagePicker._showMobileDialog();

        expect(Alert.alert).toHaveBeenCalledWith(
          "Select Photo",
          "Choose how you want to select an image",
          expect.arrayContaining([
            expect.objectContaining({ text: "Cancel" }),
            expect.objectContaining({ text: "Take Photo" }),
            expect.objectContaining({ text: "Choose from Gallery" }),
          ]),
          expect.objectContaining({
            cancelable: true,
            onDismiss: expect.any(Function),
          })
        );

        // Test cancel button
        const cancelButton = Alert.alert.mock.calls[0][2].find(btn => btn.text === "Cancel");
        const result = await new Promise(resolve => {
          cancelButton.onPress = resolve;
          cancelButton.onPress({ cancelled: true });
        });

        expect(result).toEqual({ cancelled: true });
      });
    });

    describe("_selectImageMobile", () => {
      const mockAsset = {
        type: "image/jpeg",
        fileSize: 1024 * 1024,
        base64: "mockbase64",
        uri: "file://test.jpg",
        width: 800,
        height: 600,
        fileName: "test.jpg",
      };

      it("should handle successful camera selection", async () => {
        const mockResponse = {
          didCancel: false,
          assets: [mockAsset],
        };

        mockImagePicker.launchCamera.mockImplementation((options, callback) => {
          callback(mockResponse);
        });

        const result = await ImagePicker._selectImageMobile("camera");

        expect(mockImagePicker.launchCamera).toHaveBeenCalled();
        expect(validateImage).toHaveBeenCalledWith({
          type: mockAsset.type,
          fileSize: mockAsset.fileSize,
        });
        expect(result).toEqual({
          cancelled: false,
          dataUrl: `data:${mockAsset.type};base64,${mockAsset.base64}`,
          uri: mockAsset.uri,
          type: mockAsset.type,
          size: mockAsset.fileSize,
          width: mockAsset.width,
          height: mockAsset.height,
          fileName: mockAsset.fileName,
          source: "camera",
          base64: mockAsset.base64,
        });
      });

      it("should handle successful gallery selection", async () => {
        const mockResponse = {
          didCancel: false,
          assets: [mockAsset],
        };

        mockImagePicker.launchImageLibrary.mockImplementation((options, callback) => {
          callback(mockResponse);
        });

        const result = await ImagePicker._selectImageMobile("gallery");

        expect(mockImagePicker.launchImageLibrary).toHaveBeenCalled();
        expect(result.source).toBe("gallery");
      });

      it("should handle cancelled selection", async () => {
        const mockResponse = { didCancel: true };

        mockImagePicker.launchCamera.mockImplementation((options, callback) => {
          callback(mockResponse);
        });

        const result = await ImagePicker._selectImageMobile("camera");
        expect(result).toEqual({ cancelled: true });
      });

      it("should handle errors", async () => {
        const mockResponse = {
          errorCode: "camera_unavailable",
          errorMessage: "Camera not available",
        };

        mockImagePicker.launchCamera.mockImplementation((options, callback) => {
          callback(mockResponse);
        });

        await expect(ImagePicker._selectImageMobile("camera")).rejects.toThrow(
          "Camera not available"
        );
      });

      it("should handle missing assets", async () => {
        const mockResponse = {
          didCancel: false,
          assets: [],
        };

        mockImagePicker.launchCamera.mockImplementation((options, callback) => {
          callback(mockResponse);
        });

        await expect(ImagePicker._selectImageMobile("camera")).rejects.toThrow(
          "No image selected"
        );
      });

      it("should handle validation errors", async () => {
        validateImage.mockReturnValue({
          isValid: false,
          error: "File too large",
        });

        const mockResponse = {
          didCancel: false,
          assets: [mockAsset],
        };

        mockImagePicker.launchCamera.mockImplementation((options, callback) => {
          callback(mockResponse);
        });

        await expect(ImagePicker._selectImageMobile("camera")).rejects.toThrow(
          "File too large"
        );
      });

      it("should reject when image picker not available", async () => {
        // Spy on the method and make it return null for picker
        const spy = jest.spyOn(ImagePicker, "_selectImageMobile");
        spy.mockImplementation(() => {
          return Promise.reject(new Error("Image picker not available on this platform"));
        });

        await expect(ImagePicker._selectImageMobile("camera")).rejects.toThrow(
          "Image picker not available on this platform"
        );

        spy.mockRestore();
      });
    });
  });

  describe("Utility Methods", () => {
    describe("isCameraAvailable", () => {
      it("should return false on web", () => {
        platform.isMobile = false;
        expect(ImagePicker.isCameraAvailable()).toBe(false);
      });

      it("should return true on mobile", () => {
        platform.isMobile = true;
        expect(ImagePicker.isCameraAvailable()).toBe(true);
      });
    });

    describe("isGalleryAvailable", () => {
      it("should return true on all platforms", () => {
        expect(ImagePicker.isGalleryAvailable()).toBe(true);
      });
    });

    describe("requestCameraPermission", () => {
      it("should return false on web", async () => {
        platform.isMobile = false;
        const result = await ImagePicker.requestCameraPermission();
        expect(result).toBe(false);
      });

      it("should return true on mobile", async () => {
        platform.isMobile = true;
        const result = await ImagePicker.requestCameraPermission();
        expect(result).toBe(true);
      });
    });

    describe("requestGalleryPermission", () => {
      it("should return true on web", async () => {
        platform.isMobile = false;
        const result = await ImagePicker.requestGalleryPermission();
        expect(result).toBe(true);
      });

      it("should return true on mobile", async () => {
        platform.isMobile = true;
        const result = await ImagePicker.requestGalleryPermission();
        expect(result).toBe(true);
      });
    });

    describe("getAvailableOptions", () => {
      it("should return correct options for web", () => {
        platform.isWeb = true;
        platform.isMobile = false;
        Platform.OS = "web";

        const options = ImagePicker.getAvailableOptions();

        expect(options).toEqual({
          platform: "web",
          canSelectFromGallery: true,
          canTakePhoto: false,
          supportsDragDrop: true,
          supportsMultipleSelection: true,
          maxFileSize: IMAGE_CONFIG.MAX_FILE_SIZE,
          allowedTypes: IMAGE_CONFIG.ALLOWED_TYPES,
          allowedExtensions: IMAGE_CONFIG.ALLOWED_EXTENSIONS,
        });
      });

      it("should return correct options for mobile", () => {
        platform.isWeb = false;
        platform.isMobile = true;
        Platform.OS = "ios";

        const options = ImagePicker.getAvailableOptions();

        expect(options).toEqual({
          platform: "ios",
          canSelectFromGallery: true,
          canTakePhoto: true,
          supportsDragDrop: false,
          supportsMultipleSelection: false,
          maxFileSize: IMAGE_CONFIG.MAX_FILE_SIZE,
          allowedTypes: IMAGE_CONFIG.ALLOWED_TYPES,
          allowedExtensions: IMAGE_CONFIG.ALLOWED_EXTENSIONS,
        });
      });
    });

    describe("validateResult", () => {
      it("should return invalid for cancelled result", () => {
        const result = ImagePicker.validateResult({ cancelled: true });
        expect(result).toEqual({
          isValid: false,
          error: "No image selected",
        });
      });

      it("should return invalid for null result", () => {
        const result = ImagePicker.validateResult(null);
        expect(result).toEqual({
          isValid: false,
          error: "No image selected",
        });
      });

      it("should return invalid for result without dataUrl or uri", () => {
        const result = ImagePicker.validateResult({ cancelled: false });
        expect(result).toEqual({
          isValid: false,
          error: "Invalid image result",
        });
      });

      it("should return invalid for oversized file", () => {
        const result = ImagePicker.validateResult({
          cancelled: false,
          dataUrl: "data:image/jpeg;base64,test",
          size: IMAGE_CONFIG.MAX_FILE_SIZE + 1,
        });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("File too large");
      });

      it("should return invalid for unsupported file type", () => {
        const result = ImagePicker.validateResult({
          cancelled: false,
          dataUrl: "data:image/gif;base64,test",
          type: "image/gif",
        });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Unsupported file type");
      });

      it("should return valid for good result", () => {
        const result = ImagePicker.validateResult({
          cancelled: false,
          dataUrl: "data:image/jpeg;base64,test",
          type: "image/jpeg",
          size: 1024,
        });
        expect(result).toEqual({ isValid: true });
      });
    });

    describe("getErrorMessage", () => {
      it("should return permission error message", () => {
        const error = new Error("permission denied to access camera");
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("Permission denied. Please grant access to camera/photos in settings.");
      });

      it("should return cancelled error message", () => {
        const error = new Error("Operation was cancelled by user");
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("Operation was cancelled.");
      });

      it("should return size error message", () => {
        const error = new Error("File size too large");
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("The selected image is too large. Please choose a smaller image.");
      });

      it("should return type error message", () => {
        const error = new Error("Invalid file type selected");
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("Invalid image format. Please select a JPG or PNG image.");
      });

      it("should return camera error message", () => {
        const error = new Error("camera is not available");
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("Camera is not available. Please try selecting from gallery instead.");
      });

      it("should return generic error message", () => {
        const error = new Error("Unknown error occurred");
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("Failed to select image: Unknown error occurred");
      });

      it("should handle error without message", () => {
        const error = {};
        const message = ImagePicker.getErrorMessage(error);
        expect(message).toBe("Failed to select image: Unknown error");
      });

      it("should use custom operation name", () => {
        const error = new Error("Something went wrong");
        const message = ImagePicker.getErrorMessage(error, "upload image");
        expect(message).toBe("Failed to upload image: Something went wrong");
      });
    });
  });
});
