"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createToken } from "@/lib/factory";

export function CreateToken() {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateToken = () => {
    // Validate required fields
    if (!name || !ticker || !description || !image) {
      setErrorMessage("Name, Ticker, Description and Image are required.");
      return;
    }

    // Reset error message
    setErrorMessage("");

    // Call createToken function from your factory
    createToken(name, ticker, description, image, twitter, telegram, website);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
            Create Token
          </h1>
          <p className="mt-4 text-center">
            Fill out the form to create your new token.
          </p>
        </div>
        <div className="space-y-6">
          {/* Error message */}
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}

          <div>
            <Label htmlFor="name">Name*</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter token name"
              className="mt-1 block w-full placeholder:text-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ticker">Ticker*</Label>
            <Input
              id="ticker"
              type="text"
              placeholder="Enter token ticker"
              className="mt-1 block w-full placeholder:text-secondary"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              placeholder="Enter token description"
              className="mt-1 block w-full placeholder:text-secondary"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="image">Image*</Label>
            <div
              className="mt-1 flex justify-center rounded-md border-2 border-dashed border-muted px-6 pt-5 pb-6"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center">
                  <UploadIcon className="h-12 w-12 text-muted-foreground mr-4" />
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:bg-muted-foreground hover:text-background"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/png, image/jpeg, image/gif"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be PNG, JPG, GIF up to 10MB
                </p>
                {image && (
                  <p className="text-sm text-muted-foreground">{image.name}</p>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="mb-4">Social Links (Optional)</Label>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <Label htmlFor="twitter">
                  <div className="flex items-center">
                    <TwitterIcon className="h-5 w-5 mr-2" />
                    Twitter
                  </div>
                </Label>
                <Input
                  id="twitter"
                  type="text"
                  placeholder="Enter Twitter link"
                  className="mt-2 block w-full placeholder:text-secondary"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telegram">
                  <div className="flex items-center">
                    <TextIcon className="h-5 w-5 mr-2" />
                    Telegram
                  </div>
                </Label>
                <Input
                  id="telegram"
                  type="text"
                  placeholder="Enter Telegram link"
                  className="mt-2 block w-full placeholder:text-secondary"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">
                  <div className="flex items-center">
                    <GlobeIcon className="h-5 w-5 mr-2" />
                    Website
                  </div>
                </Label>
                <Input
                  id="website"
                  type="text"
                  placeholder="Enter website link"
                  className="mt-2 block w-full placeholder:text-secondary"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={handleCreateToken}
          >
            Create Token
          </Button>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function TextIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function UploadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
