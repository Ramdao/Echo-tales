import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          Game: path.resolve(__dirname, 'game.html'),
          ChapterSolution: path.resolve(__dirname, 'ChapterSolution.html'),
          Setup: path.resolve(__dirname, 'howtoplay.html'),
          End: path.resolve(__dirname, 'end.html'),
          Prologue: path.resolve(__dirname, 'prologue.html'),
          Epilogue: path.resolve(__dirname, 'epilogue.html'),
        },
      },
    },
  });
  