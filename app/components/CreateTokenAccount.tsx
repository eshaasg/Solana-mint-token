"use client";

import React, { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

const CreateTokenAccount: FC = () => {
  const [txSig, setTxSig] = useState("");
  const [tokenAccount, setTokenAccount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const isValidPublicKey = (key: string) => {
    try {
      new web3.PublicKey(key);
      return true;
    } catch {
      return false;
    }
  };

  const createTokenAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    const ownerValue = event.currentTarget.owner.value;
    const mintValue = event.currentTarget.mint.value;

    if (!isValidPublicKey(ownerValue) || !isValidPublicKey(mintValue)) {
      alert("Please enter valid public key addresses.");
      return;
    }

    const transaction = new web3.Transaction();
    const owner = new web3.PublicKey(ownerValue);
    const mint = new web3.PublicKey(mintValue);

    const associatedToken = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        associatedToken,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    setLoading(true);
    try {
      const sig = await sendTransaction(transaction, connection);
      setTxSig(sig);
      setTokenAccount(associatedToken.toString());
      setConfirmed(true);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please check the console for more details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-14 ml-96">
      <div className="ml-44">
        <div className="ml-28 font-bold text-xl text-white mb-4">Create Token Mint</div>
        <div className="flex">
          <form
            onSubmit={createTokenAccount}
            className="bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% p-10 rounded-xl w-96 text-lg"
          >
            <label className="mb-4 font-semibold block">Token Mint Address: </label>
            <input
              className="mb-4 bg-coal/25 text-center text-black rounded-lg w-full p-2"
              id="mint"
              required
            />
            <label className="mb-4 font-semibold block">Token Account Owner: </label>
            <input
              className="mb-4 bg-coal/25 text-center text-black rounded-lg w-full p-2"
              id="owner"
              required
            />
            <button 
              className="block font-semibold bg-coal text-white text-xl p-4 w-full rounded-lg"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
        </div>
        <div className="mt-4 text-white mr-20">
          {confirmed ? (
            <p className="w-full">
              You can view your transaction on Solana Explorer at:
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-500 underline w-1/5 text-sm"
              >
                View
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreateTokenAccount;