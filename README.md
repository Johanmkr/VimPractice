# NVIM Guide

[![Deploy to GitHub Pages](https://github.com/Johanmkr/VimPractice/actions/workflows/deploy.yml/badge.svg)](https://johanmkr.github.io/VimPractice/)

A static, interactive reference site for learning Neovim — hosted on GitHub Pages.

## Pages

| Page | Description |
|---|---|
| **Home** (`index.html`) | Landing page with links to all sections |
| **Basics** (`basics.html`) | Modes, motions, operators, and core commands |
| **Advanced** (`advanced.html`) | Registers, macros, marks, folds, and more |
| **Vim vs Neovim** (`vs-vim.html`) | What Neovim adds over classic Vim |
| **LazyVim** (`lazyvim.html`) | Why and how to layer LazyVim on top of Neovim |
| **VS Code → Nvim** (`vscode-to-nvim.html`) | Transition guide from VS Code to Neovim |
| **Tutorial** (`tutorial.html`) | Step-by-step guide for new Vim users |
| **Cheatsheet** (`cheatsheet.html`) | Quick-reference card for common keybindings |
| **Practice** (`practice.html`) | Browser-based interactive Vim-mode editor |

## Development

No build step — open any `.html` file directly in a browser.

```sh
# Quick local server (Python)
python3 -m http.server
# then open http://localhost:8000
```

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the workflow in `.github/workflows/deploy.yml`.

## License

MIT — see [LICENSE](LICENSE).
