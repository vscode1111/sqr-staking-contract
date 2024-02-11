import { expect } from 'chai';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    it('should be correct init values', async function () {
      expect(await this.ownerSQRStaking.owner()).eq(this.owner2Address);
    });
  });
}
