import { vi } from "vitest";

import {
  decryptData,
  encryptData,
  generateEncryptionKey,
} from "../../data/encryption";

describe("encryption", () => {
  it("reuses imported keys for repeated encrypt/decrypt operations", async () => {
    const key = await generateEncryptionKey();
    const importKeySpy = vi.spyOn(window.crypto.subtle, "importKey");

    const firstMessage = "first payload";
    const secondMessage = "second payload";

    const firstEncrypted = await encryptData(key, firstMessage);
    const firstDecrypted = await decryptData(
      firstEncrypted.iv,
      firstEncrypted.encryptedBuffer,
      key,
    );

    const secondEncrypted = await encryptData(key, secondMessage);
    const secondDecrypted = await decryptData(
      secondEncrypted.iv,
      secondEncrypted.encryptedBuffer,
      key,
    );

    expect(new TextDecoder().decode(firstDecrypted)).toBe(firstMessage);
    expect(new TextDecoder().decode(secondDecrypted)).toBe(secondMessage);
    expect(importKeySpy).toHaveBeenCalledTimes(1);

    importKeySpy.mockRestore();
  });
});
