const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getAccount } = require("../contracts/helpers");

describe("Mint NFT Contract", function () {
  let NiceNFT;
  let niceNFT;
  let owner;

  beforeEach(async function () {
    NiceNFT = await ethers.getContractFactory("NFT", getAccount());

    [owner] = await ethers.getSigners();
    niceNFT = await NiceNFT.deploy();
    await niceNFT.deployed();
  });

  describe("NFT Deployment", function () {
    it("Should have the correct owner", async function () {
      expect(await niceNFT.owner()).to.equal(owner.address);
    });

    it("Should have the correct balance after minting", async function () {
      const initialBalance = await niceNFT.balanceOf(owner.address);
      expect(initialBalance.toString()).to.equal("0");

      const tx = await niceNFT.mintTo(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        {
          gasLimit: 500_000,
          value: ethers.utils.parseEther("0.008"),
        }
      );

      const finalBalance = await niceNFT.balanceOf(owner.address);
      expect(finalBalance.toString()).to.equal("1");
    });

    it("withdrawPayments", async function () {
      await niceNFT.withdrawPayments(
        "0x1A1AAbEEEc644BA425b00A5Bb942a8EfAA06ec9e"
      );
    });
  });
});
