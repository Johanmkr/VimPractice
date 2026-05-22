// =============================================
// Neovim Practice — Editor Simulation
// State-machine based, no handler-swapping hacks
// =============================================

// --- EXERCISES ---
const EXERCISES = [
  // ── NAVIGATION ──────────────────────────────────────────────────────────
  {
    category: "Navigation",
    title: "Basic hjkl Navigation",
    filename: "navigation.txt",
    goal: "Move to the word <span class='goal'>TARGET</span> using only h, j, k, l keys.",
    hint: "Press <kbd>j</kbd> to go down, <kbd>l</kbd> to go right. No arrow keys!",
    content: [
      "Welcome to the Neovim practice editor!",
      "Use h (left), j (down), k (up), l (right) to navigate.",
      "",
      "Navigate down to this line first...",
      "...then go right to reach ====>   TARGET   <====",
      "",
      "Remember: no arrow keys allowed!"
    ],
    check: (s) => {
      const line = s.lines[s.cursor.row];
      const idx = line && line.indexOf("TARGET");
      return idx >= 0 && s.cursor.col >= idx && s.cursor.col <= idx + 5;
    }
  },
  {
    category: "Navigation",
    title: "Word Jumps: w, b, e",
    filename: "words.txt",
    goal: "Jump to the word <span class='goal'>DESTINATION</span> using <kbd>w</kbd> or <kbd>b</kbd>.",
    hint: "Press <kbd>w</kbd> to jump forward one word at a time. Much faster than holding l!",
    content: [
      "one two three four five six seven eight nine ten",
      "alpha beta gamma delta epsilon zeta eta theta iota",
      "DESTINATION is the word you need to reach on this line",
      "using word motions: w=next word, b=prev word, e=word end"
    ],
    check: (s) => {
      const line = s.lines[s.cursor.row];
      return line && line.includes("DESTINATION") && s.cursor.col === line.indexOf("DESTINATION");
    }
  },
  {
    category: "Navigation",
    title: "Line Motions: 0, ^, $",
    filename: "lines.txt",
    goal: "Reach the <span class='goal'>END</span> marker using <kbd>$</kbd>, then return to start with <kbd>0</kbd>.",
    hint: "Press <kbd>$</kbd> to jump to end of line, <kbd>0</kbd> for absolute start, <kbd>^</kbd> for first non-blank.",
    content: [
      "First line — use $ to reach the [END]",
      "   Second line starts with spaces — use ^ for first non-blank char",
      "Third line — mix motions freely"
    ],
    check: (s) => s.usedDollar && s.usedZero
  },
  {
    category: "Navigation",
    title: "File Navigation: gg, G",
    filename: "bigfile.txt",
    goal: "Jump to the bottom with <span class='goal'>G</span>, then back to the top with <span class='goal'>gg</span>.",
    hint: "Press <kbd>G</kbd> (Shift+g) for last line, <kbd>gg</kbd> for first line.",
    content: [
      "=== TOP OF FILE — you start here ===",
      "Line 2", "Line 3", "Line 4", "Line 5",
      "Line 6", "Line 7", "Line 8", "Line 9",
      "Line 10", "Line 11", "Line 12", "Line 13",
      "Line 14", "Line 15", "Line 16", "Line 17",
      "=== BOTTOM OF FILE — use G to reach here, then gg to return ==="
    ],
    check: (s) => s.visitedTop && s.visitedBottom
  },
  {
    category: "Navigation",
    title: "f and t Jumps",
    filename: "jumps.txt",
    goal: "Use <span class='goal'>f</span> at least twice to jump to characters on a line.",
    hint: "Press <kbd>f</kbd> then a character to jump TO it. Press <kbd>;</kbd> to repeat.",
    content: [
      "find the @ symbol with f@ — try it on this line!",
      "use tx to jump just before the X: hello X world",
      "Press ; to repeat the last f or t jump forward",
      "Press , to repeat it backward"
    ],
    check: (s) => s.fJumpCount >= 2
  },
  {
    category: "Navigation",
    title: "Half-Page Scrolling",
    filename: "scroll.txt",
    goal: "Scroll down with <span class='goal'>Ctrl+d</span> then back up with <span class='goal'>Ctrl+u</span>.",
    hint: "Hold Ctrl and press <kbd>d</kbd> to scroll down half a page, <kbd>u</kbd> to scroll up.",
    content: [
      "Line 1 — scroll down from here",
      "Line 2", "Line 3", "Line 4", "Line 5",
      "Line 6", "Line 7", "Line 8", "Line 9",
      "Line 10", "Line 11", "Line 12", "Line 13",
      "Line 14", "Line 15", "Line 16", "Line 17",
      "Line 18", "Line 19", "Line 20",
      "Line 21 — then scroll back up with Ctrl+u!"
    ],
    check: (s) => s.usedCtrlD && s.usedCtrlU
  },
  {
    category: "Navigation",
    title: "Bracket Matching: %",
    filename: "brackets.txt",
    goal: "Use <span class='goal'>%</span> to jump between matching brackets.",
    hint: "Place cursor on any bracket and press <kbd>%</kbd> to jump to its match.",
    content: [
      "function example(x, y) {",
      "  if (x > 0) {",
      "    return [x, y];",
      "  }",
      "}",
      "",
      "Jump from ( to ) then { to } and [ to ] using %"
    ],
    check: (s) => s.usedPercent
  },
  {
    category: "Navigation",
    title: "Screen Positions: H, M, L",
    filename: "screen.txt",
    goal: "Jump to top with <span class='goal'>H</span>, middle with <span class='goal'>M</span>, and bottom with <span class='goal'>L</span>.",
    hint: "<kbd>H</kbd> = top of screen, <kbd>M</kbd> = middle, <kbd>L</kbd> = bottom. No scrolling needed!",
    content: [
      "=== Use H to jump here (top of screen) ===",
      "Line 2", "Line 3", "Line 4", "Line 5",
      "Line 6", "Line 7", "Line 8", "Line 9",
      "Line 10", "Line 11", "Line 12",
      "=== Use M to reach the middle ===",
      "Line 14", "Line 15", "Line 16",
      "Line 17", "Line 18", "Line 19",
      "=== Use L to jump here (bottom of screen) ==="
    ],
    check: (s) => s.usedH && s.usedM && s.usedL
  },

  // ── INSERT & EDIT ─────────────────────────────────────────────────────────
  {
    category: "Insert & Edit",
    title: "Insert Mode: i, o",
    filename: "insert.txt",
    goal: "Add the text <span class='goal'>INSERTED</span> anywhere in the file using Insert mode.",
    hint: "Press <kbd>i</kbd> to enter Insert mode, type INSERTED, then press <kbd>Esc</kbd> to return to Normal.",
    content: [
      "This file needs some new text.",
      "Press i to enter insert mode, type, then Esc to exit.",
      "",
      "Try pressing o to open a new line below and type there!"
    ],
    check: (s) => s.lines.some(l => l.includes("INSERTED"))
  },
  {
    category: "Insert & Edit",
    title: "Append: a, A, I",
    filename: "append.txt",
    goal: "Use <span class='goal'>A</span> to append text to the end of an incomplete line.",
    hint: "<kbd>A</kbd> jumps to end of line and enters Insert mode. <kbd>I</kbd> goes to the start.",
    content: [
      "This line is incomplete —",
      "so is this one —",
      "and this one —",
      "",
      "Use A to append ' COMPLETE' to any of the lines above."
    ],
    check: (s) => s.usedCapitalA && s.lines.some(l => l.includes("COMPLETE"))
  },
  {
    category: "Insert & Edit",
    title: "Open New Lines: o, O",
    filename: "newlines.txt",
    goal: "Use <span class='goal'>o</span> to open a line below and type something, then <span class='goal'>O</span> above.",
    hint: "<kbd>o</kbd> opens a line below and enters Insert mode. <kbd>O</kbd> opens a line above.",
    content: [
      "First line",
      "Second line",
      "Third line",
      "",
      "Use o on line 2 to insert text between 2nd and 3rd.",
      "Use O on line 3 to insert text before it."
    ],
    check: (s) => s.lines.length >= 8
  },
  {
    category: "Insert & Edit",
    title: "Replace Char: r",
    filename: "replace_char.txt",
    goal: "Fix the typos by pressing <span class='goal'>r</span> then the correct character.",
    hint: "<kbd>r</kbd> replaces the char under cursor without entering Insert mode.",
    content: [
      "Thix sentence has a typo.",
      "Sn does thes one.",
      "And thiq one too.",
      "",
      "Use r to fix: x→s, n→o, s→i, q→s"
    ],
    check: (s) => !s.lines.some(l => /Thix|thes|thiq/.test(l)) &&
                  !s.lines[1].startsWith("Sn ")
  },
  {
    category: "Insert & Edit",
    title: "Join Lines: J",
    filename: "join.txt",
    goal: "Join the first three lines into one sentence using <span class='goal'>J</span>.",
    hint: "Press <kbd>J</kbd> to join the current line with the line below. Use <kbd>3J</kbd> to join 3 at once.",
    content: [
      "This sentence is",
      "split across",
      "multiple lines.",
      "",
      "Use J (or 3J) to merge the first three lines."
    ],
    check: (s) => s.lines.some(l => l.includes("This sentence is") && l.includes("split across"))
  },
  {
    category: "Insert & Edit",
    title: "Replace Mode: R",
    filename: "replace_mode.txt",
    goal: "Overwrite the dashes with text using <span class='goal'>R</span> (Replace mode).",
    hint: "<kbd>R</kbd> enters Replace mode — typing overwrites characters instead of inserting.",
    content: [
      "Name:    --------",
      "City:    --------",
      "Country: --------",
      "",
      "Navigate to the dashes and use R to overwrite them."
    ],
    check: (s) => !s.lines.some(l => l.includes("--------"))
  },

  // ── DELETE & CHANGE ───────────────────────────────────────────────────────
  {
    category: "Delete & Change",
    title: "Delete Lines: dd",
    filename: "delete.txt",
    goal: "Delete <span class='goal'>all</span> lines that say DELETE THIS LINE using <kbd>dd</kbd>.",
    hint: "Move to the target line with j/k, then press <kbd>dd</kbd> to delete it. Repeat for each.",
    content: [
      "Keep this line.",
      "DELETE THIS LINE",
      "Keep this line too.",
      "And this one stays.",
      "DELETE THIS LINE",
      "Final keeper line."
    ],
    check: (s) => !s.lines.some(l => l.includes("DELETE THIS LINE"))
  },
  {
    category: "Delete & Change",
    title: "Delete with Motion: dw, d$",
    filename: "dmotion.txt",
    goal: "Use <span class='goal'>dw</span> to delete a word and <span class='goal'>d$</span> to delete to end of line.",
    hint: "<kbd>dw</kbd> deletes from cursor to next word. <kbd>d$</kbd> deletes to end of line.",
    content: [
      "Remove the EXTRA word from this sentence.",
      "Delete everything after this: REMOVE THIS PART",
      "This line is fine, leave it alone.",
      "",
      "Use dw on 'EXTRA' and d$ starting at 'REMOVE'."
    ],
    check: (s) => !s.lines.some(l => l.includes("EXTRA")) &&
                  !s.lines.some(l => l.includes("REMOVE THIS PART"))
  },
  {
    category: "Delete & Change",
    title: "Change Word: cw, ciw",
    filename: "change.txt",
    goal: "Change every <span class='goal'>WRONG</span> to something else using <kbd>cw</kbd> or <kbd>ciw</kbd>.",
    hint: "<kbd>cw</kbd> changes from cursor to end of word. <kbd>ciw</kbd> changes the whole word regardless of cursor position.",
    content: [
      "The WRONG answer is not acceptable.",
      "Please enter the WRONG value here.",
      "This is totally WRONG.",
      "",
      "Use cw or ciw to replace each WRONG."
    ],
    check: (s) => !s.lines.some(l => l.includes("WRONG"))
  },
  {
    category: "Delete & Change",
    title: "Delete Char: x",
    filename: "xdelete.txt",
    goal: "Fix the doubled letters using <span class='goal'>x</span> to delete the extra character.",
    hint: "<kbd>x</kbd> deletes the character under cursor. Navigate to the extra letter and press x.",
    content: [
      "Remoove the extra letters.",
      "Neovimm is great.",
      "Practicce makes perfect.",
      "",
      "Use x to remove one letter from each doubled pair."
    ],
    check: (s) => s.lines.some(l => l === "Remove the extra letters.") &&
                  s.lines.some(l => l === "Neovim is great.") &&
                  s.lines.some(l => l === "Practice makes perfect.")
  },
  {
    category: "Delete & Change",
    title: "Change to EOL: C and D",
    filename: "ceol.txt",
    goal: "Use <span class='goal'>D</span> to delete to end of line, <span class='goal'>C</span> to change to end.",
    hint: "<kbd>D</kbd> deletes from cursor to EOL. <kbd>C</kbd> does the same then enters Insert mode.",
    content: [
      "Keep this part: DELETE THE REST OF THIS LINE",
      "Keep this part: CHANGE THIS TO SOMETHING NEW",
      "This line is fine.",
      "",
      "Put cursor on 'DELETE' or 'CHANGE' and use D or C."
    ],
    check: (s) => !s.lines[0].includes("DELETE THE REST") &&
                  !s.lines[1].includes("CHANGE THIS TO SOMETHING NEW")
  },

  // ── YANK & PASTE ──────────────────────────────────────────────────────────
  {
    category: "Yank & Paste",
    title: "Yank & Paste: yy, p",
    filename: "paste.txt",
    goal: "Copy line 1 with <span class='goal'>yy</span>, then paste a duplicate anywhere below it.",
    hint: "On line 1 press <kbd>yy</kbd> to yank it, then navigate and press <kbd>p</kbd> to paste.",
    content: [
      "COPY ME — yank this line with yy",
      "Line 2",
      "Line 3",
      "Line 4",
      "Paste the copied line somewhere below here"
    ],
    check: (s) => s.lines.filter(l => l.includes("COPY ME")).length >= 2
  },
  {
    category: "Yank & Paste",
    title: "Paste Before: P",
    filename: "paste_before.txt",
    goal: "Yank the last line and paste it <span class='goal'>before</span> the target using <kbd>P</kbd>.",
    hint: "<kbd>p</kbd> pastes after the cursor line. <kbd>P</kbd> pastes before it.",
    content: [
      "--- PASTE TARGET: paste above this line ---",
      "Line A",
      "Line B",
      "Line C",
      "YANK THIS LINE"
    ],
    check: (s) => {
      const targetIdx = s.lines.findIndex(l => l.includes("--- PASTE TARGET"));
      return targetIdx > 0 && s.lines[targetIdx - 1].includes("YANK THIS LINE");
    }
  },
  {
    category: "Yank & Paste",
    title: "Yank Word: yw",
    filename: "yank_word.txt",
    goal: "Yank the word <span class='goal'>KEYWORD</span> with <kbd>yw</kbd> and paste it where marked.",
    hint: "<kbd>yw</kbd> yanks from cursor to end of the next word. Navigate and <kbd>p</kbd> to paste.",
    content: [
      "The word KEYWORD should be duplicated.",
      "Paste it here: [BLANK]",
      "And also here: [BLANK]",
      "",
      "Use yw on KEYWORD, then navigate to [BLANK] and paste."
    ],
    check: (s) => s.lines.filter(l => l.includes("KEYWORD")).length >= 2
  },

  // ── VISUAL MODE ───────────────────────────────────────────────────────────
  {
    category: "Visual Mode",
    title: "Visual Line: V + d",
    filename: "visual.txt",
    goal: "Select and delete the line <span class='goal'>=== DELETE ME ===</span> using <kbd>V</kbd> then <kbd>d</kbd>.",
    hint: "Move to the target line, press <kbd>V</kbd> to select it, then <kbd>d</kbd> to delete.",
    content: [
      "Keep this line.",
      "Keep this too.",
      "=== DELETE ME ===",
      "This line stays.",
      "This line stays too."
    ],
    check: (s) => !s.lines.some(l => l.includes("DELETE ME"))
  },
  {
    category: "Visual Mode",
    title: "Visual Char: v + y",
    filename: "vchar.txt",
    goal: "Use <span class='goal'>v</span> to select just the word <span class='goal'>GRAB</span>, yank it, then paste.",
    hint: "Press <kbd>v</kbd> to start char-visual, use motion to select GRAB, press <kbd>y</kbd> to yank, then <kbd>p</kbd> to paste.",
    content: [
      "This line has the word GRAB in it.",
      "Paste it here: [empty slot]",
      "",
      "Select only 'GRAB' with v+motion+y, then paste with p."
    ],
    check: (s) => s.lines.some(l => l !== "This line has the word GRAB in it." && l.includes("GRAB"))
  },
  {
    category: "Visual Mode",
    title: "Visual Indent: V + >",
    filename: "vindent.txt",
    goal: "Select the inner lines and indent them with <kbd>V</kbd> then <kbd>></kbd>.",
    hint: "Press <kbd>V</kbd> then <kbd>j</kbd> to select multiple lines, then <kbd>></kbd> to indent them.",
    content: [
      "function hello() {",
      "console.log('hello');",
      "console.log('world');",
      "return true;",
      "}",
      "",
      "Select lines 2-4 with V and indent them with >."
    ],
    check: (s) => s.lines[1] && s.lines[1].startsWith("  ") &&
                  s.lines[2] && s.lines[2].startsWith("  ")
  },
  {
    category: "Visual Mode",
    title: "Visual Uppercase: V + U",
    filename: "vcase.txt",
    goal: "Select the first two lines and uppercase them with <span class='goal'>U</span>.",
    hint: "Press <kbd>V</kbd> to select lines, then <kbd>U</kbd> to uppercase, <kbd>u</kbd> to lowercase.",
    content: [
      "this text needs to be uppercased",
      "make this one all caps too",
      "LEAVE THIS LINE ALONE",
      "",
      "Select lines 1-2 with V+j and press U."
    ],
    check: (s) => s.lines[0] === s.lines[0].toUpperCase() &&
                  s.lines[1] === s.lines[1].toUpperCase()
  },

  // ── TEXT OBJECTS ──────────────────────────────────────────────────────────
  {
    category: "Text Objects",
    title: "Text Objects: ci\"",
    filename: "textobj.txt",
    goal: "Change the word inside quotes using <span class='goal'>ci\"</span>.",
    hint: "Place cursor inside or near the quoted text, then type <kbd>ci\"</kbd> to change it.",
    content: [
      "const greeting = \"Hello World\";",
      "const name = \"change me\";",
      "console.log(\"old value\");",
      "",
      "Try ciw to change word under cursor,",
      "or ci( to change inside parentheses: func(argument)"
    ],
    check: (s) => s.usedTextObject
  },
  {
    category: "Text Objects",
    title: "Change Inner Word: ciw",
    filename: "ciw.txt",
    goal: "Use <span class='goal'>ciw</span> to replace every <span class='goal'>OLDWORD</span> without moving to its start.",
    hint: "<kbd>ciw</kbd> works from anywhere inside a word — no need to navigate to the first letter.",
    content: [
      "The OLDWORD should be replaced.",
      "Change OLDWORD without moving to its start.",
      "ciw works from anywhere inside the OLDWORD!",
      "",
      "Put cursor anywhere on OLDWORD, then type ciw."
    ],
    check: (s) => !s.lines.some(l => l.includes("OLDWORD"))
  },
  {
    category: "Text Objects",
    title: "Delete Around Word: daw",
    filename: "daw.txt",
    goal: "Use <span class='goal'>daw</span> to delete <span class='goal'>REMOVE</span> including surrounding space.",
    hint: "<kbd>daw</kbd> deletes the word AND surrounding whitespace — cleaner than <kbd>dw</kbd>.",
    content: [
      "Please REMOVE this word from the sentence.",
      "Also delete REMOVE from here too.",
      "daw vs dw: daw cleans up the extra space!",
      "",
      "Use daw on each 'REMOVE' word."
    ],
    check: (s) => !s.lines.some(l => l.includes("REMOVE"))
  },
  {
    category: "Text Objects",
    title: "Change Inside Parens: ci(",
    filename: "ci_paren.txt",
    goal: "Change the arguments inside each function call using <span class='goal'>ci(</span>.",
    hint: "Put cursor anywhere between the parens, type <kbd>ci(</kbd> to delete contents and enter Insert mode.",
    content: [
      "print(old_argument)",
      "greet(wrong_name)",
      "calculate(bad_value)",
      "",
      "Use ci( to replace each argument with something new."
    ],
    check: (s) => !s.lines.some(l =>
      /print\(old_argument\)|greet\(wrong_name\)|calculate\(bad_value\)/.test(l))
  },
  {
    category: "Text Objects",
    title: "Delete Paragraph: dap",
    filename: "dap.txt",
    goal: "Delete the second paragraph using <span class='goal'>dap</span>.",
    hint: "Place cursor anywhere inside a paragraph and type <kbd>dap</kbd> to delete the whole paragraph.",
    content: [
      "This is the first paragraph.",
      "It has two lines of text.",
      "",
      "DELETE THIS PARAGRAPH",
      "It should be removed entirely.",
      "",
      "This is the third paragraph.",
      "Keep this one intact."
    ],
    check: (s) => !s.lines.some(l => l.includes("DELETE THIS PARAGRAPH"))
  },

  // ── SEARCH & REPLACE ──────────────────────────────────────────────────────
  {
    category: "Search & Replace",
    title: "Search Forward: /",
    filename: "search.txt",
    goal: "Search for <span class='goal'>needle</span> and navigate through at least 3 matches using <kbd>n</kbd>.",
    hint: "Type <kbd>/needle</kbd> then Enter to search. Press <kbd>n</kbd> to jump to the next match.",
    content: [
      "Searching is one of the most powerful Neovim features.",
      "There is a needle hidden in this haystack of text.",
      "Keep looking — another needle might appear further down.",
      "Line after line of text to search through.",
      "Found another needle yet? Keep pressing n!",
      "One more needle for good measure.",
      "Use N to search backwards through the needles."
    ],
    check: (s) => s.nPresses >= 3
  },
  {
    category: "Search & Replace",
    title: "Word Search: *",
    filename: "star.txt",
    goal: "Use <span class='goal'>*</span> to search for the word under the cursor.",
    hint: "Place cursor on any word and press <kbd>*</kbd> to find all occurrences. Press <kbd>n</kbd> to cycle.",
    content: [
      "The word target appears multiple times.",
      "Press * on target to find the next target.",
      "Another target is hiding here.",
      "And one final target at the end.",
      "",
      "Use * on 'target', then n to cycle through all matches."
    ],
    check: (s) => s.usedStar
  },
  {
    category: "Search & Replace",
    title: "Line Substitution: :s",
    filename: "subst.txt",
    goal: "Replace 'fox' with 'cat' on the current line using <span class='goal'>:s/fox/cat/</span>.",
    hint: "Type <kbd>:s/fox/cat/</kbd> — this replaces the first match on the current line.",
    content: [
      "The quick brown fox jumps over the lazy dog.",
      "Another fox is on this line too.",
      "A third fox appears here.",
      "",
      "Use :s/fox/cat/ on the current line, then repeat on others."
    ],
    check: (s) => s.usedSubstitute
  },
  {
    category: "Search & Replace",
    title: "Global Substitute: :%s",
    filename: "gsubst.txt",
    goal: "Replace <span class='goal'>all</span> occurrences of 'bad' with 'good' using <span class='goal'>:%s/bad/good/g</span>.",
    hint: "<kbd>:%s/bad/good/g</kbd> — % means all lines, g means all matches per line.",
    content: [
      "This is bad code with bad logic.",
      "The bad variable has a bad value.",
      "bad naming makes bad programs.",
      "",
      "Use :%s/bad/good/g to fix every occurrence at once."
    ],
    check: (s) => !s.lines.some(l => l.includes("bad"))
  },

  // ── UNDO & REPEAT ─────────────────────────────────────────────────────────
  {
    category: "Undo & Repeat",
    title: "Undo & Redo: u, Ctrl+r",
    filename: "undo.txt",
    goal: "Delete a line with <span class='goal'>dd</span>, undo with <span class='goal'>u</span>, redo with <span class='goal'>Ctrl+r</span>.",
    hint: "Press <kbd>dd</kbd> to delete, <kbd>u</kbd> to undo, <kbd>Ctrl+r</kbd> to redo.",
    content: [
      "Practice undo and redo here.",
      "Delete this line with dd, then undo it with u.",
      "Then redo the deletion with Ctrl+r.",
      "The dot command (.) repeats your last change too!",
      "Try: delete a line, move to another, press . to repeat."
    ],
    check: (s) => s.undoCount >= 1 && s.redoCount >= 1
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    category: "Advanced",
    title: "Indentation: >>, <<",
    filename: "indent.txt",
    goal: "Indent the inner lines using <span class='goal'>>></span> and remove indent with <span class='goal'><<</span>.",
    hint: "<kbd>>></kbd> indents the current line. <kbd><<</kbd> unindents. Use a count: <kbd>3>></kbd>.",
    content: [
      "function greet(name) {",
      "console.log('Hello', name);",
      "return name;",
      "}",
      "",
      "Indent lines 2-3 with >> so they sit inside the function."
    ],
    check: (s) => s.lines[1] && s.lines[1].startsWith("  ") &&
                  s.lines[2] && s.lines[2].startsWith("  ")
  },
  {
    category: "Advanced",
    title: "Case Toggle: ~, gU, gu",
    filename: "case.txt",
    goal: "Uppercase a line with <span class='goal'>gU</span>, lowercase with <span class='goal'>gu</span>, or toggle with <span class='goal'>~</span>.",
    hint: "<kbd>~</kbd> toggles one char. <kbd>gU</kbd> uppercases the current line. <kbd>gu</kbd> lowercases.",
    content: [
      "this line should become UPPERCASE",
      "THIS LINE SHOULD BECOME lowercase",
      "Toggle Individual Chars With Tilde",
      "",
      "Use gU on line 1, gu on line 2, ~ on line 3."
    ],
    check: (s) => s.usedCaseToggle
  },
  {
    category: "Advanced",
    title: "Count Prefixes",
    filename: "counts.txt",
    goal: "Use <span class='goal'>count prefixes</span> to multiply commands: <kbd>5j</kbd>, <kbd>3w</kbd>, <kbd>2dd</kbd>.",
    hint: "Type a number before any motion or command to repeat it. <kbd>5j</kbd> moves down 5 lines at once.",
    content: [
      "Start here — press 5j to jump to line 6.",
      "Line 2", "Line 3", "Line 4", "Line 5",
      "=== You should land here with 5j ===",
      "Line 7", "Line 8",
      "Use 2dd to delete these two lines at once.",
      "Last line."
    ],
    check: (s) => s.usedCountPrefix
  },
  {
    category: "Advanced",
    title: "Macros",
    filename: "macros.txt",
    goal: "Record a macro with <span class='goal'>qa</span>, make a change, stop with <span class='goal'>q</span>, replay with <span class='goal'>@a</span>.",
    hint: "Press <kbd>qa</kbd> to start recording, make changes, <kbd>q</kbd> to stop, <kbd>@a</kbd> to replay.",
    content: [
      "item: apple",
      "item: banana",
      "item: cherry",
      "item: date",
      "item: elderberry",
      "",
      "Goal: Use a macro to transform each 'item: ' line"
    ],
    check: (s) => s.macroPlayed
  },

  // ── FREE PRACTICE ─────────────────────────────────────────────────────────
  {
    category: "Free Practice",
    title: "Free Practice",
    filename: "scratch.lua",
    goal: "Free practice — try any commands you like! No goal to reach.",
    hint: "Try: <kbd>ciw</kbd> to change a word, <kbd>%</kbd> to jump between brackets, <kbd>V</kbd>+<kbd>></kbd> to indent.",
    content: [
      "-- Free practice buffer",
      "local function greet(name)",
      "  local message = 'Hello, ' .. name .. '!'",
      "  print(message)",
      "  return message",
      "end",
      "",
      "-- Try editing this Lua code",
      "-- ciw = change inner word",
      "-- % = jump to matching bracket",
      "-- V then > = indent selected lines",
      "-- gg=G = re-indent entire file",
      "",
      "local result = greet('World')",
      "print(result)"
    ],
    check: () => false
  }
];

// --- STATE ---
function freshState(ex) {
  return {
    lines: ex.content.map(l => l),
    cursor: { row: 0, col: 0 },

    // Mode state machine
    mode: 'normal',
    submode: 'normal',

    // Pending operator: 'd','y','c','>','<','='
    pendingOp: null,
    countStr: '',

    // f/t last jump
    lastFt: null,

    // Clipboard
    clipboard: { type: 'char', text: '' },

    // Undo/redo stacks
    undoStack: [],
    redoStack: [],

    // Registers for macros (a-z)
    macroRegisters: {},
    recording: null,
    recordingKeys: [],
    macroPlayed: false,

    // Search
    searchQuery: '',
    searchDir: 1,

    // Command/search input
    cmdBuffer: '',

    // Exercise tracking — existing
    visitedTop: false,
    visitedBottom: false,
    usedDollar: false,
    usedZero: false,
    nPresses: 0,
    fJumpCount: 0,
    undoCount: 0,
    redoCount: 0,
    usedTextObject: false,

    // Exercise tracking — new
    usedCtrlD: false,
    usedCtrlU: false,
    usedPercent: false,
    usedH: false,
    usedM: false,
    usedL: false,
    usedCapitalA: false,
    usedStar: false,
    usedSubstitute: false,
    usedCaseToggle: false,
    usedCountPrefix: false,

    // For status/feedback
    message: '',
  };
}

let state = null;
let currentExercise = 0;
let completedExercises = new Set();

// --- LOAD EXERCISE ---
function loadExercise(idx) {
  currentExercise = idx;
  const ex = EXERCISES[idx];
  state = freshState(ex);

  document.getElementById('editor-filename').textContent = ex.filename;
  document.getElementById('task-instruction').innerHTML =
    `<span class="goal-label">Goal:</span> ${ex.goal}`;
  document.querySelectorAll('.exercise-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  render();
  document.getElementById('vim-editor').focus();
}

function resetExercise() { loadExercise(currentExercise); }
function skipExercise() {
  if (currentExercise < EXERCISES.length - 1) loadExercise(currentExercise + 1);
}
function showHint() {
  const ex = EXERCISES[currentExercise];
  document.getElementById('task-instruction').innerHTML =
    `<span class="goal-label">Goal:</span> ${ex.goal} &nbsp;<span class="hint-label">Hint: ${ex.hint}</span>`;
}

// --- RENDER ---
function render() {
  const container = document.getElementById('editor-lines');
  const visRange = getVisualRange();

  container.innerHTML = state.lines.map((line, row) => {
    const isCursorRow = row === state.cursor.row;
    const inVisual = state.mode === 'visual' || state.mode === 'vline';
    let content = '';

    if (line.length === 0) {
      content = isCursorRow ? `<span class="char-cursor">&nbsp;</span>` : '&nbsp;';
    } else {
      for (let col = 0; col < line.length; col++) {
        const raw = line[col];
        const ch = raw === '&' ? '&amp;' : raw === '<' ? '&lt;' : raw === '>' ? '&gt;' : raw === ' ' ? '&nbsp;' : raw;
        const isCursor = isCursorRow && col === state.cursor.col;
        const isSel = inVisual && visRange && inRange(row, col, visRange);
        if (isCursor) {
          const cls = state.mode === 'insert' ? 'char-cursor insert-cursor' : 'char-cursor';
          content += `<span class="${cls}">${ch}</span>`;
        } else if (isSel) {
          content += `<span class="char-selected">${ch}</span>`;
        } else {
          content += ch;
        }
      }
      // Insert cursor past EOL
      if (isCursorRow && state.mode === 'insert' && state.cursor.col >= line.length) {
        content += `<span class="char-cursor insert-cursor">&nbsp;</span>`;
      }
    }

    return `<div class="editor-line${isCursorRow ? ' cursor-line' : ''}">` +
      `<span class="line-number">${row + 1}</span>` +
      `<span class="line-content">${content}</span></div>`;
  }).join('');

  // Scroll cursor into view
  const lineEls = container.querySelectorAll('.editor-line');
  if (lineEls[state.cursor.row]) lineEls[state.cursor.row].scrollIntoView({ block: 'nearest' });

  updateStatusLine();
  updateCmdLine();
}

function getVisualRange() {
  if ((state.mode !== 'visual' && state.mode !== 'vline') || !state.visualStart) return null;
  const s = state.visualStart, e = state.cursor;
  if (state.mode === 'vline') {
    return { r1: Math.min(s.row, e.row), c1: 0, r2: Math.max(s.row, e.row), c2: Infinity };
  }
  if (s.row < e.row || (s.row === e.row && s.col <= e.col))
    return { r1: s.row, c1: s.col, r2: e.row, c2: e.col };
  return { r1: e.row, c1: e.col, r2: s.row, c2: s.col };
}

function inRange(row, col, r) {
  if (row < r.r1 || row > r.r2) return false;
  if (row === r.r1 && col < r.c1) return false;
  if (row === r.r2 && col > r.c2) return false;
  return true;
}

function updateStatusLine() {
  const sl = document.getElementById('statusline');
  const modeName = {
    normal: 'NORMAL', insert: 'INSERT', visual: 'VISUAL',
    vline: 'V-LINE', vblock: 'V-BLOCK', command: 'COMMAND',
    search: 'SEARCH', replace: 'REPLACE'
  }[state.mode] || 'NORMAL';
  const modeClass = {
    insert: 'insert-mode', visual: 'visual-mode', vline: 'visual-mode',
    command: 'command-mode', search: 'command-mode', replace: 'replace-mode'
  }[state.mode] || '';

  sl.className = modeClass;
  document.getElementById('status-mode').textContent =
    state.recording ? `RECORDING @${state.recording}` : modeName;
  document.getElementById('status-pos').textContent =
    `${state.cursor.row + 1}:${state.cursor.col + 1}  ${EXERCISES[currentExercise].filename}`;
}

function updateCmdLine() {
  const el = document.getElementById('cmdline-text');
  if (state.mode === 'command') { el.textContent = ':' + state.cmdBuffer; return; }
  if (state.mode === 'search') { el.textContent = (state.searchDir > 0 ? '/' : '?') + state.cmdBuffer; return; }
  if (state.message) { el.textContent = state.message; return; }

  const prefix = state.countStr;
  if (state.submode === 'g') { el.textContent = prefix + 'g'; return; }
  if (state.submode === 'f_pending') { el.textContent = prefix + (state.pendingFCmd || 'f'); return; }
  if (state.submode === 'r_pending') { el.textContent = 'r'; return; }
  if (state.submode === 'macro_record_name') { el.textContent = 'q'; return; }
  if (state.submode === 'macro_play_name') { el.textContent = '@'; return; }
  if (state.pendingOp) {
    const obj = state.pendingObjMod || '';
    el.textContent = prefix + state.pendingOp + obj;
    return;
  }
  el.textContent = prefix || '';
}

function flashMessage(msg, ms = 2000) {
  state.message = msg;
  render();
  setTimeout(() => { if (state.message === msg) { state.message = ''; render(); } }, ms);
}

// --- MAIN KEY HANDLER ---
function handleKey(e) {
  if (e.metaKey) return;
  // Allow some browser shortcuts
  if (e.ctrlKey && !['d','u','f','b','r','v','['].includes(e.key.toLowerCase())) return;
  e.preventDefault();

  const key = resolveKey(e);

  // Record macro keys before dispatching
  if (state.recording && state.submode !== 'macro_record_name') {
    if (key !== 'q' || state.submode !== 'normal') {
      state.recordingKeys.push(key);
    }
  }

  switch (state.mode) {
    case 'normal':   handleNormal(key); break;
    case 'insert':   handleInsert(key); break;
    case 'visual':
    case 'vline':    handleVisual(key); break;
    case 'replace':  handleReplace(key); break;
    case 'command':
    case 'search':   handleCmdline(key); break;
  }

  checkGoal();
  render();
}

function resolveKey(e) {
  if (e.ctrlKey) return 'C-' + e.key.toLowerCase();
  if (e.key === 'Escape')    return 'Esc';
  if (e.key === 'Enter')     return 'CR';
  if (e.key === 'Backspace') return 'BS';
  if (e.key === 'Tab')       return 'Tab';
  if (e.key === 'ArrowLeft') return 'h';
  if (e.key === 'ArrowRight')return 'l';
  if (e.key === 'ArrowUp')   return 'k';
  if (e.key === 'ArrowDown') return 'j';
  if (e.key === 'Delete')    return 'Del';
  return e.key;
}

// --- NORMAL MODE (state machine) ---
function handleNormal(key) {
  // --- Sub-state: waiting for 2nd 'g' key ---
  if (state.submode === 'g') {
    state.submode = 'normal';
    const count = consumeCount();
    if (key === 'g') { gotoLine(0); state.visitedTop = true; }
    else if (key === 'e') { for (let i=0;i<count;i++) motionGe(); }
    else if (key === 'E') { for (let i=0;i<count;i++) motionGe(true); }
    else if (key === 'j') moveRow(count);
    else if (key === 'k') moveRow(-count);
    else if (key === '_') { moveToLastNonBlank(); }
    else if (key === '~') { toggleCaseMotion(); state.usedCaseToggle = true; }
    else if (key === 'u') { lowercaseMotion(); state.usedCaseToggle = true; }
    else if (key === 'U') { uppercaseMotion(); state.usedCaseToggle = true; }
    return;
  }

  // --- Sub-state: waiting for f/t char ---
  if (state.submode === 'f_pending') {
    const cmd = state.pendingFCmd;
    state.submode = 'normal';
    state.pendingFCmd = null;
    const count = consumeCount();
    for (let i=0;i<count;i++) {
      if (cmd === 'f') fJump(key, true, false);
      else if (cmd === 'F') fJump(key, false, false);
      else if (cmd === 't') fJump(key, true, true);
      else if (cmd === 'T') fJump(key, false, true);
    }
    state.lastFt = { cmd, ch: key };
    state.fJumpCount++;
    // Apply pending op if any
    if (state.pendingOp) finishOpAtCursor(state.pendingOp);
    return;
  }

  // --- Sub-state: waiting for r char ---
  if (state.submode === 'r_pending') {
    state.submode = 'normal';
    if (key !== 'Esc') {
      saveUndo();
      const count = consumeCount();
      const line = state.lines[state.cursor.row];
      let rep = '';
      for (let i = 0; i < count; i++) rep += (key === 'CR' ? '\n' : key);
      state.lines[state.cursor.row] =
        line.slice(0, state.cursor.col) + rep + line.slice(state.cursor.col + count);
      state.cursor.col = Math.min(state.cursor.col + count - 1, state.lines[state.cursor.row].length - 1);
    }
    return;
  }

  // --- Sub-state: waiting for macro register name (q) ---
  if (state.submode === 'macro_record_name') {
    state.submode = 'normal';
    if (/^[a-z]$/.test(key)) {
      state.recording = key;
      state.recordingKeys = [];
      flashMessage(`Recording @${key}`);
    }
    return;
  }

  // --- Sub-state: waiting for macro play name (@) ---
  if (state.submode === 'macro_play_name') {
    state.submode = 'normal';
    const count = consumeCount();
    if (key === '@') {
      if (state.lastMacro) playMacro(state.lastMacro, count);
    } else if (/^[a-z]$/.test(key)) {
      playMacro(key, count);
    }
    return;
  }

  // --- Pending operator: waiting for motion or text object ---
  if (state.pendingOp) {
    handleOpMotion(key);
    return;
  }

  // --- Count prefix ---
  if (/^\d$/.test(key) && !(key === '0' && state.countStr === '')) {
    state.countStr += key;
    return;
  }

  const count = consumeCount();

  // --- Normal keys ---
  switch (key) {
    // Movement
    case 'h': for(let i=0;i<count;i++) moveCol(-1); break;
    case 'l': for(let i=0;i<count;i++) moveCol(1); break;
    case 'j': moveRow(count); break;
    case 'k': moveRow(-count); break;
    case 'w': for(let i=0;i<count;i++) motionWordFwd(false); break;
    case 'W': for(let i=0;i<count;i++) motionWordFwd(true); break;
    case 'b': for(let i=0;i<count;i++) motionWordBwd(false); break;
    case 'B': for(let i=0;i<count;i++) motionWordBwd(true); break;
    case 'e': for(let i=0;i<count;i++) motionWordEnd(false); break;
    case 'E': for(let i=0;i<count;i++) motionWordEnd(true); break;
    case '0': state.cursor.col = 0; state.usedZero = true; break;
    case '^': {
      const s = state.lines[state.cursor.row] || '';
      state.cursor.col = Math.max(0, s.search(/\S/));
      break;
    }
    case '$': {
      const ln = state.lines[state.cursor.row] || '';
      state.cursor.col = Math.max(0, ln.length - 1);
      state.usedDollar = true;
      break;
    }
    case 'g': state.submode = 'g'; state.countStr = String(count > 1 ? count : ''); break;
    case 'G': gotoLine(count > 1 ? count - 1 : state.lines.length - 1); state.visitedBottom = true; break;
    case 'H': gotoLine(0); state.usedH = true; break;
    case 'M': gotoLine(Math.floor(state.lines.length / 2)); state.usedM = true; break;
    case 'L': gotoLine(state.lines.length - 1); state.usedL = true; break;
    case 'C-d': moveRow(Math.max(1, Math.floor(visibleRows() / 2))); state.usedCtrlD = true; break;
    case 'C-u': moveRow(-Math.max(1, Math.floor(visibleRows() / 2))); state.usedCtrlU = true; break;
    case 'C-f': moveRow(visibleRows()); break;
    case 'C-b': moveRow(-visibleRows()); break;
    case '%': jumpMatchingBracket(); state.usedPercent = true; break;
    case 'f': state.submode = 'f_pending'; state.pendingFCmd = 'f'; state.countStr = String(count > 1 ? count : ''); break;
    case 'F': state.submode = 'f_pending'; state.pendingFCmd = 'F'; state.countStr = String(count > 1 ? count : ''); break;
    case 't': state.submode = 'f_pending'; state.pendingFCmd = 't'; state.countStr = String(count > 1 ? count : ''); break;
    case 'T': state.submode = 'f_pending'; state.pendingFCmd = 'T'; state.countStr = String(count > 1 ? count : ''); break;
    case ';': if (state.lastFt) repeatFt(true, count); break;
    case ',': if (state.lastFt) repeatFt(false, count); break;

    // Insert entry
    case 'i': enterInsert(0); break;
    case 'I': {
      const ln = state.lines[state.cursor.row] || '';
      state.cursor.col = Math.max(0, ln.search(/\S/));
      enterInsert(0);
      break;
    }
    case 'a': enterInsert(1); break;
    case 'A': {
      state.cursor.col = (state.lines[state.cursor.row] || '').length;
      enterInsert(0);
      state.usedCapitalA = true;
      break;
    }
    case 'o': {
      saveUndo();
      state.lines.splice(state.cursor.row + 1, 0, getAutoIndent(state.cursor.row));
      state.cursor.row++;
      state.cursor.col = state.lines[state.cursor.row].length;
      state.mode = 'insert';
      break;
    }
    case 'O': {
      saveUndo();
      state.lines.splice(state.cursor.row, 0, getAutoIndent(state.cursor.row));
      state.cursor.col = state.lines[state.cursor.row].length;
      state.mode = 'insert';
      break;
    }
    case 's': {
      saveUndo();
      const ln = state.lines[state.cursor.row];
      const c = Math.min(count, ln.length - state.cursor.col);
      state.clipboard = { type: 'char', text: ln.slice(state.cursor.col, state.cursor.col + c) };
      state.lines[state.cursor.row] = ln.slice(0, state.cursor.col) + ln.slice(state.cursor.col + c);
      clampCursor();
      state.mode = 'insert';
      break;
    }
    case 'S': {
      saveUndo();
      const ind = getAutoIndent(state.cursor.row);
      state.lines[state.cursor.row] = ind;
      state.cursor.col = ind.length;
      state.mode = 'insert';
      break;
    }
    case 'C': {
      saveUndo();
      const ln = state.lines[state.cursor.row];
      state.clipboard = { type: 'char', text: ln.slice(state.cursor.col) };
      state.lines[state.cursor.row] = ln.slice(0, state.cursor.col);
      state.mode = 'insert';
      break;
    }
    case 'D': {
      saveUndo();
      const ln = state.lines[state.cursor.row];
      state.clipboard = { type: 'char', text: ln.slice(state.cursor.col) };
      state.lines[state.cursor.row] = ln.slice(0, state.cursor.col);
      clampCursor();
      break;
    }

    // Operators (wait for motion)
    case 'd': state.pendingOp = 'd'; break;
    case 'y': state.pendingOp = 'y'; break;
    case 'c': state.pendingOp = 'c'; break;
    case '>': { saveUndo(); indentRange(state.cursor.row, state.cursor.row + count - 1, 1); break; }
    case '<': { saveUndo(); indentRange(state.cursor.row, state.cursor.row + count - 1, -1); break; }
    case '=': { saveUndo(); autoIndentRange(state.cursor.row, state.cursor.row + count - 1); break; }

    // Single-key edits
    case 'x': {
      saveUndo();
      for (let i = 0; i < count; i++) {
        const ln = state.lines[state.cursor.row];
        if (state.cursor.col < ln.length) {
          state.lines[state.cursor.row] = ln.slice(0, state.cursor.col) + ln.slice(state.cursor.col + 1);
        }
      }
      clampCursor();
      break;
    }
    case 'X': {
      saveUndo();
      for (let i = 0; i < count; i++) {
        if (state.cursor.col > 0) {
          const ln = state.lines[state.cursor.row];
          state.lines[state.cursor.row] = ln.slice(0, state.cursor.col - 1) + ln.slice(state.cursor.col);
          state.cursor.col--;
        }
      }
      clampCursor();
      break;
    }
    case 'r': state.submode = 'r_pending'; state.countStr = String(count > 1 ? count : ''); break;
    case 'R': state.mode = 'replace'; break;
    case '~': {
      saveUndo();
      const ln = state.lines[state.cursor.row];
      if (state.cursor.col < ln.length) {
        const c = ln[state.cursor.col];
        state.lines[state.cursor.row] =
          ln.slice(0, state.cursor.col) +
          (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()) +
          ln.slice(state.cursor.col + 1);
        moveCol(1);
        state.usedCaseToggle = true;
      }
      break;
    }
    case 'J': {
      saveUndo();
      for (let i = 0; i < count; i++) {
        if (state.cursor.row < state.lines.length - 1) {
          state.lines[state.cursor.row] =
            state.lines[state.cursor.row].trimEnd() + ' ' + state.lines[state.cursor.row + 1].trimStart();
          state.lines.splice(state.cursor.row + 1, 1);
        }
      }
      break;
    }

    // Paste
    case 'p': paste(true, count); break;
    case 'P': paste(false, count); break;

    // Undo/redo
    case 'u': for(let i=0;i<count;i++) undo(); break;
    case 'C-r': for(let i=0;i<count;i++) redo(); break;

    // Dot repeat
    case '.': dotRepeat(); break;

    // Visual
    case 'v': enterVisual('visual'); break;
    case 'V': enterVisual('vline'); break;
    case 'C-v': enterVisual('vblock'); break;

    // Search
    case '/': state.mode = 'search'; state.searchDir = 1; state.cmdBuffer = ''; break;
    case '?': state.mode = 'search'; state.searchDir = -1; state.cmdBuffer = ''; break;
    case 'n': for(let i=0;i<count;i++) { nextMatch(state.searchDir); state.nPresses++; } break;
    case 'N': for(let i=0;i<count;i++) nextMatch(-state.searchDir); break;
    case '*': searchWord(1); state.usedStar = true; break;
    case '#': searchWord(-1); break;

    // Command
    case ':': state.mode = 'command'; state.cmdBuffer = ''; break;

    // Macro record/play
    case 'q': {
      if (state.recording) {
        // Stop recording — remove the final 'q' we mistakenly added
        state.recordingKeys.pop();
        state.macroRegisters[state.recording] = [...state.recordingKeys];
        state.lastMacro = state.recording;
        flashMessage(`Recorded @${state.recording}`);
        state.recording = null;
        state.recordingKeys = [];
      } else {
        state.submode = 'macro_record_name';
      }
      break;
    }
    case '@': state.submode = 'macro_play_name'; break;

    // Scroll cursor centering
    case 'z': {
      const editorEl = document.getElementById('editor-lines');
      const curEl = editorEl.querySelectorAll('.editor-line')[state.cursor.row];
      if (curEl) curEl.scrollIntoView({ block: 'center' });
      break;
    }

    case 'Esc': {
      state.submode = 'normal';
      state.pendingOp = null;
      state.countStr = '';
      state.pendingFCmd = null;
      break;
    }
  }
}

// --- OPERATOR + MOTION ---
function handleOpMotion(key) {
  const op = state.pendingOp;
  const count = consumeCount();

  // Double operator: dd, yy, cc, >>, <<, ==
  if (key === op || (op === '>' && key === '>') || (op === '<' && key === '<') || (op === '=' && key === '=')) {
    state.pendingOp = null;
    state.pendingObjMod = null;
    if (op === 'd') { for(let i=0;i<count;i++) deleteLine(state.cursor.row); }
    else if (op === 'y') { yankLines(state.cursor.row, count); }
    else if (op === 'c') { saveUndo(); for(let i=0;i<count;i++) deleteLine(state.cursor.row); state.mode = 'insert'; state.cursor.col = 0; }
    else if (op === '>') { saveUndo(); indentRange(state.cursor.row, state.cursor.row + count - 1, 1); }
    else if (op === '<') { saveUndo(); indentRange(state.cursor.row, state.cursor.row + count - 1, -1); }
    else if (op === '=') { saveUndo(); autoIndentRange(state.cursor.row, state.cursor.row + count - 1); }
    return;
  }

  // Text objects: i or a followed by object
  if (key === 'i' || key === 'a') {
    state.pendingObjMod = key;
    return;
  }
  if (state.pendingObjMod) {
    const mod = state.pendingObjMod;
    state.pendingObjMod = null;
    state.pendingOp = null;
    applyTextObject(op, mod, key);
    return;
  }

  // Motion keys
  state.pendingOp = null;
  const startCursor = { ...state.cursor };

  let motionResult = applyMotionKey(key, count);
  if (!motionResult) return;

  const endCursor = { ...state.cursor };
  state.cursor = startCursor;

  // Apply operator over range [startCursor, endCursor]
  applyOpRange(op, startCursor, endCursor, motionResult.linewise);
}

function applyMotionKey(key, count) {
  let linewise = false;
  switch (key) {
    case 'h': for(let i=0;i<count;i++) moveCol(-1); break;
    case 'l': for(let i=0;i<count;i++) moveCol(1); break;
    case 'j': moveRow(count); linewise = true; break;
    case 'k': moveRow(-count); linewise = true; break;
    case 'w': for(let i=0;i<count;i++) motionWordFwd(false); break;
    case 'W': for(let i=0;i<count;i++) motionWordFwd(true); break;
    case 'b': for(let i=0;i<count;i++) motionWordBwd(false); break;
    case 'B': for(let i=0;i<count;i++) motionWordBwd(true); break;
    case 'e': for(let i=0;i<count;i++) motionWordEnd(false); break;
    case 'E': for(let i=0;i<count;i++) motionWordEnd(true); break;
    case '$': state.cursor.col = Math.max(0, (state.lines[state.cursor.row]||'').length - 1); break;
    case '0': state.cursor.col = 0; break;
    case '^': { const s = state.lines[state.cursor.row]||''; state.cursor.col = Math.max(0, s.search(/\S/)); break; }
    case 'G': gotoLine(count > 1 ? count - 1 : state.lines.length - 1); linewise = true; break;
    case 'f': state.pendingOp = state.pendingOp; state.submode = 'f_pending'; state.pendingFCmd = 'f'; return null;
    case 't': state.pendingOp = state.pendingOp; state.submode = 'f_pending'; state.pendingFCmd = 't'; return null;
    case 'F': state.pendingOp = state.pendingOp; state.submode = 'f_pending'; state.pendingFCmd = 'F'; return null;
    case 'T': state.pendingOp = state.pendingOp; state.submode = 'f_pending'; state.pendingFCmd = 'T'; return null;
    case 'Esc': return null;
    default: return null;
  }
  return { linewise };
}

function applyOpRange(op, from, to, linewise) {
  saveUndo();
  let r1 = from.row, c1 = from.col, r2 = to.row, c2 = to.col;
  if (r1 > r2 || (r1 === r2 && c1 > c2)) {
    [r1, r2] = [r2, r1]; [c1, c2] = [c2, c1];
  }

  if (linewise) {
    const text = state.lines.slice(r1, r2 + 1).join('\n');
    state.clipboard = { type: 'line', text };
    if (op === 'd' || op === 'c') {
      state.lines.splice(r1, r2 - r1 + 1);
      if (state.lines.length === 0) state.lines = [''];
      state.cursor.row = Math.min(r1, state.lines.length - 1);
      state.cursor.col = 0;
      if (op === 'c') state.mode = 'insert';
    } else if (op === 'y') {
      state.cursor = { row: r1, col: c1 };
    }
  } else {
    if (r1 === r2) {
      const ln = state.lines[r1];
      const text = ln.slice(c1, c2 + 1);
      state.clipboard = { type: 'char', text };
      if (op === 'd' || op === 'c') {
        state.lines[r1] = ln.slice(0, c1) + ln.slice(c2 + 1);
        state.cursor = { row: r1, col: c1 };
        clampCursor();
        if (op === 'c') state.mode = 'insert';
      } else if (op === 'y') {
        state.cursor = { row: r1, col: c1 };
      }
    } else {
      const text = [
        state.lines[r1].slice(c1),
        ...state.lines.slice(r1 + 1, r2),
        state.lines[r2].slice(0, c2 + 1)
      ].join('\n');
      state.clipboard = { type: 'char', text };
      if (op === 'd' || op === 'c') {
        const joined = state.lines[r1].slice(0, c1) + state.lines[r2].slice(c2 + 1);
        state.lines.splice(r1, r2 - r1 + 1, joined);
        state.cursor = { row: r1, col: c1 };
        clampCursor();
        if (op === 'c') state.mode = 'insert';
      } else if (op === 'y') {
        state.cursor = { row: r1, col: c1 };
      }
    }
  }
}

// --- TEXT OBJECTS ---
function applyTextObject(op, mod, obj) {
  saveUndo();
  const row = state.cursor.row;
  const line = state.lines[row] || '';
  const col = state.cursor.col;

  let range = null;

  // Word objects
  if (obj === 'w' || obj === 'W') {
    const big = obj === 'W';
    const isWord = big ? c => !/\s/.test(c) : c => /\w/.test(c);
    let start = col, end = col;
    while (start > 0 && isWord(line[start - 1])) start--;
    while (end < line.length - 1 && isWord(line[end + 1])) end++;
    if (mod === 'a') {
      if (end + 1 < line.length && /\s/.test(line[end + 1])) end++;
      else if (start > 0 && /\s/.test(line[start - 1])) start--;
    }
    range = { r1: row, c1: start, r2: row, c2: end, type: 'char' };
  }

  // Sentence
  if (obj === 's') {
    let start = col, end = col;
    while (start > 0 && !/[.!?]/.test(line[start - 1])) start--;
    while (end < line.length - 1 && !/[.!?]/.test(line[end])) end++;
    range = { r1: row, c1: start, r2: row, c2: end, type: 'char' };
  }

  // Paragraph
  if (obj === 'p') {
    let r1 = row, r2 = row;
    while (r1 > 0 && state.lines[r1 - 1].trim() !== '') r1--;
    while (r2 < state.lines.length - 1 && state.lines[r2 + 1].trim() !== '') r2++;
    range = { r1, c1: 0, r2, c2: state.lines[r2].length - 1, type: 'line' };
  }

  // Pairs: () [] {} <> '' "" ``
  const pairOpen  = { ')': '(', ']': '[', '}': '{', '>': '<', '"': '"', "'": "'", '`': '`', 'b': '(', 'B': '{', 't': '<' };
  const pairClose = { '(': ')', '[': ']', '{': '}', '<': '>', '"': '"', "'": "'", '`': '`', 'b': ')', 'B': '}', 't': '>' };

  if (pairClose[obj] || pairOpen[obj]) {
    const open = pairOpen[obj] || obj;
    const close = pairClose[obj] || obj;
    const isPair = open !== close;

    let openCol = -1, closeCol = -1;

    if (isPair) {
      let depth = 0;
      for (let c = col; c >= 0; c--) {
        if (line[c] === close) depth++;
        else if (line[c] === open) {
          if (depth === 0) { openCol = c; break; }
          depth--;
        }
      }
      if (openCol === -1) return;
      depth = 0;
      for (let c = openCol + 1; c < line.length; c++) {
        if (line[c] === open) depth++;
        else if (line[c] === close) {
          if (depth === 0) { closeCol = c; break; }
          depth--;
        }
      }
    } else {
      let left = col - 1, right = col + 1;
      if (line[col] === open) { openCol = col; }
      else {
        while (left >= 0 && line[left] !== open) left--;
        openCol = left;
      }
      if (openCol < 0) return;
      right = openCol + 1;
      while (right < line.length && line[right] !== close) right++;
      closeCol = right;
    }

    if (openCol < 0 || closeCol < 0) return;
    const c1 = mod === 'i' ? openCol + 1 : openCol;
    const c2 = mod === 'i' ? closeCol - 1 : closeCol;
    range = { r1: row, c1, r2: row, c2, type: 'char' };
  }

  if (!range) return;
  state.usedTextObject = true;

  const text = range.type === 'line'
    ? state.lines.slice(range.r1, range.r2 + 1).join('\n')
    : state.lines[range.r1].slice(range.c1, range.c2 + 1);

  state.clipboard = { type: range.type, text };

  if (op === 'y') {
    state.cursor = { row: range.r1, col: range.c1 };
    return;
  }

  if (range.type === 'line') {
    state.lines.splice(range.r1, range.r2 - range.r1 + 1);
    if (state.lines.length === 0) state.lines = [''];
    state.cursor.row = Math.min(range.r1, state.lines.length - 1);
    state.cursor.col = 0;
  } else {
    const ln = state.lines[range.r1];
    state.lines[range.r1] = ln.slice(0, range.c1) + ln.slice(range.c2 + 1);
    state.cursor = { row: range.r1, col: range.c1 };
    clampCursor();
  }

  if (op === 'c') state.mode = 'insert';
}

// --- INSERT MODE ---
function enterInsert(colOffset) {
  saveUndo();
  const ln = state.lines[state.cursor.row] || '';
  state.cursor.col = Math.min(state.cursor.col + colOffset, ln.length);
  state.mode = 'insert';
}

function handleInsert(key) {
  if (key === 'Esc' || key === 'C-[') {
    state.mode = 'normal';
    const ln = state.lines[state.cursor.row] || '';
    state.cursor.col = Math.max(0, Math.min(state.cursor.col, ln.length - 1));
    return;
  }
  if (key === 'C-c') { state.mode = 'normal'; return; }

  const row = state.cursor.row;
  const line = state.lines[row] || '';

  if (key === 'CR') {
    const indent = (line.match(/^(\s*)/) || ['',''])[1];
    const before = line.slice(0, state.cursor.col);
    const after = line.slice(state.cursor.col);
    state.lines[row] = before;
    state.lines.splice(row + 1, 0, indent + after);
    state.cursor.row++;
    state.cursor.col = indent.length;
  } else if (key === 'BS') {
    if (state.cursor.col > 0) {
      state.lines[row] = line.slice(0, state.cursor.col - 1) + line.slice(state.cursor.col);
      state.cursor.col--;
    } else if (row > 0) {
      const prevLen = state.lines[row - 1].length;
      state.lines[row - 1] += line;
      state.lines.splice(row, 1);
      state.cursor.row--;
      state.cursor.col = prevLen;
    }
  } else if (key === 'Tab') {
    state.lines[row] = line.slice(0, state.cursor.col) + '  ' + line.slice(state.cursor.col);
    state.cursor.col += 2;
  } else if (key === 'Del') {
    if (state.cursor.col < line.length) {
      state.lines[row] = line.slice(0, state.cursor.col) + line.slice(state.cursor.col + 1);
    }
  } else if (key.length === 1) {
    state.lines[row] = line.slice(0, state.cursor.col) + key + line.slice(state.cursor.col);
    state.cursor.col++;
  }
}

// --- REPLACE MODE ---
function handleReplace(key) {
  if (key === 'Esc') { state.mode = 'normal'; return; }
  if (key === 'BS') { moveCol(-1); return; }
  if (key.length === 1) {
    const row = state.cursor.row;
    const line = state.lines[row];
    if (state.cursor.col < line.length) {
      state.lines[row] = line.slice(0, state.cursor.col) + key + line.slice(state.cursor.col + 1);
    } else {
      state.lines[row] += key;
    }
    state.cursor.col++;
  }
}

// --- VISUAL MODE ---
function enterVisual(mode) {
  state.mode = mode;
  state.visualStart = { ...state.cursor };
}

function handleVisual(key) {
  if (key === 'Esc' || key === 'C-[') {
    state.mode = 'normal';
    state.visualStart = null;
    return;
  }

  // Allow movement in visual
  const movKeys = ['h','j','k','l','w','W','b','B','e','E','0','^','$','G','H','M','L',
                   'C-d','C-u','C-f','C-b','f','F','t','T',';',',','%'];
  if (movKeys.includes(key)) {
    const prevMode = state.mode;
    state.mode = 'normal';
    handleNormal(key);
    if (state.mode === 'normal') state.mode = prevMode;
    return;
  }

  const range = getVisualRange();
  if (!range) return;

  const actions = {
    'd': () => { deleteVisual(range); state.mode = 'normal'; state.visualStart = null; },
    'x': () => { deleteVisual(range); state.mode = 'normal'; state.visualStart = null; },
    'y': () => { yankVisual(range); state.mode = 'normal'; state.cursor = { row: range.r1, col: range.c1 }; state.visualStart = null; },
    'c': () => { saveUndo(); deleteVisual(range); state.mode = 'insert'; state.visualStart = null; },
    '>': () => { saveUndo(); indentRange(range.r1, range.r2, 1); state.mode = 'normal'; state.visualStart = null; },
    '<': () => { saveUndo(); indentRange(range.r1, range.r2, -1); state.mode = 'normal'; state.visualStart = null; },
    '=': () => { saveUndo(); autoIndentRange(range.r1, range.r2); state.mode = 'normal'; state.visualStart = null; },
    'J': () => {
      saveUndo();
      for (let r = range.r1; r < range.r2; r++) {
        state.lines[range.r1] = state.lines[range.r1].trimEnd() + ' ' + state.lines[range.r1 + 1].trimStart();
        state.lines.splice(range.r1 + 1, 1);
      }
      state.mode = 'normal'; state.visualStart = null;
    },
    'u': () => {
      saveUndo();
      for (let r = range.r1; r <= range.r2; r++) {
        const c1 = r === range.r1 ? range.c1 : 0;
        const c2 = r === range.r2 ? Math.min(range.c2, state.lines[r].length - 1) : state.lines[r].length - 1;
        state.lines[r] = state.lines[r].slice(0,c1) + state.lines[r].slice(c1,c2+1).toLowerCase() + state.lines[r].slice(c2+1);
      }
      state.mode = 'normal'; state.visualStart = null;
    },
    'U': () => {
      saveUndo();
      for (let r = range.r1; r <= range.r2; r++) {
        const c1 = r === range.r1 ? range.c1 : 0;
        const c2 = r === range.r2 ? Math.min(range.c2, state.lines[r].length - 1) : state.lines[r].length - 1;
        state.lines[r] = state.lines[r].slice(0,c1) + state.lines[r].slice(c1,c2+1).toUpperCase() + state.lines[r].slice(c2+1);
      }
      state.mode = 'normal'; state.visualStart = null;
    },
    '~': () => {
      saveUndo();
      for (let r = range.r1; r <= range.r2; r++) {
        const c1 = r === range.r1 ? range.c1 : 0;
        const c2 = r === range.r2 ? Math.min(range.c2, state.lines[r].length - 1) : state.lines[r].length - 1;
        const seg = state.lines[r].slice(c1, c2+1).split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        state.lines[r] = state.lines[r].slice(0,c1) + seg + state.lines[r].slice(c2+1);
      }
      state.mode = 'normal'; state.visualStart = null;
    },
    'p': () => { saveUndo(); deleteVisual(range); paste(true, 1); state.mode = 'normal'; state.visualStart = null; },
    ':': () => { state.mode = 'command'; state.cmdBuffer = "'<,'>"; },
    'v': () => { state.mode = state.mode === 'vline' ? 'visual' : 'normal'; },
    'V': () => { state.mode = state.mode === 'vline' ? 'normal' : 'vline'; },
  };

  if (actions[key]) actions[key]();
}

function deleteVisual(range) {
  saveUndo();
  if (state.mode === 'vline') {
    const text = state.lines.splice(range.r1, range.r2 - range.r1 + 1).join('\n');
    state.clipboard = { type: 'line', text };
    if (state.lines.length === 0) state.lines = [''];
    state.cursor.row = Math.min(range.r1, state.lines.length - 1);
    state.cursor.col = 0;
  } else {
    if (range.r1 === range.r2) {
      const ln = state.lines[range.r1];
      state.clipboard = { type: 'char', text: ln.slice(range.c1, range.c2 + 1) };
      state.lines[range.r1] = ln.slice(0, range.c1) + ln.slice(range.c2 + 1);
      state.cursor = { row: range.r1, col: range.c1 };
    } else {
      const text = [state.lines[range.r1].slice(range.c1), ...state.lines.slice(range.r1+1, range.r2), state.lines[range.r2].slice(0, range.c2+1)].join('\n');
      state.clipboard = { type: 'char', text };
      const joined = state.lines[range.r1].slice(0, range.c1) + state.lines[range.r2].slice(range.c2 + 1);
      state.lines.splice(range.r1, range.r2 - range.r1 + 1, joined);
      state.cursor = { row: range.r1, col: range.c1 };
    }
    clampCursor();
  }
}

function yankVisual(range) {
  if (state.mode === 'vline') {
    state.clipboard = { type: 'line', text: state.lines.slice(range.r1, range.r2+1).join('\n') };
  } else if (range.r1 === range.r2) {
    state.clipboard = { type: 'char', text: state.lines[range.r1].slice(range.c1, range.c2+1) };
  } else {
    state.clipboard = { type: 'char', text: [state.lines[range.r1].slice(range.c1), ...state.lines.slice(range.r1+1,range.r2), state.lines[range.r2].slice(0,range.c2+1)].join('\n') };
  }
}

// --- COMMAND LINE ---
function handleCmdline(key) {
  if (key === 'Esc') {
    state.mode = 'normal';
    state.cmdBuffer = '';
    return;
  }
  if (key === 'CR') {
    if (state.mode === 'search') {
      state.searchQuery = state.cmdBuffer;
      nextMatch(state.searchDir);
    } else {
      executeCommand(state.cmdBuffer);
    }
    state.mode = 'normal';
    state.cmdBuffer = '';
    return;
  }
  if (key === 'BS') { state.cmdBuffer = state.cmdBuffer.slice(0, -1); return; }
  if (key.length === 1) state.cmdBuffer += key;
}

function executeCommand(cmd) {
  cmd = cmd.trim();
  if (cmd === 'w') { flashMessage('"practice file" written'); return; }
  if (cmd === 'q' || cmd === 'q!') { flashMessage('E37: Cannot quit browser'); return; }
  if (cmd === 'wq' || cmd === 'x') { flashMessage('File saved (simulated)'); return; }
  if (cmd === 'noh' || cmd === 'nohlsearch') { state.searchQuery = ''; flashMessage('Search cleared'); return; }
  if (/^(\d+)$/.test(cmd)) { gotoLine(parseInt(cmd) - 1); return; }

  // Substitution: s/from/to/flags or %s/...
  const subMatch = cmd.match(/^(%?)s\/(.+?)\/(.*)\/([gi]*)$/);
  if (subMatch) {
    const [, glob, from, to, flags] = subMatch;
    saveUndo();
    const isGlobal = flags.includes('g') || !!glob;
    const re = new RegExp(from, isGlobal ? 'g' : '');
    if (glob) {
      state.lines = state.lines.map(l => l.replace(re, to));
    } else {
      state.lines[state.cursor.row] = state.lines[state.cursor.row].replace(re, to);
    }
    state.usedSubstitute = true;
    flashMessage('Substitution complete');
    return;
  }
  flashMessage(`Not an editor command: ${cmd}`);
}

// --- MACRO PLAYBACK ---
function playMacro(reg, count) {
  const keys = state.macroRegisters[reg];
  if (!keys || keys.length === 0) { flashMessage(`Nothing in @${reg}`); return; }
  state.macroPlayed = true;
  for (let c = 0; c < count; c++) {
    for (const k of keys) {
      const prevRec = state.recording;
      state.recording = null;
      switch (state.mode) {
        case 'normal': handleNormal(k); break;
        case 'insert': handleInsert(k); break;
        case 'visual':
        case 'vline': handleVisual(k); break;
        case 'command':
        case 'search': handleCmdline(k); break;
      }
      state.recording = prevRec;
    }
  }
  state.lastMacro = reg;
  flashMessage(`Played @${reg} ${count}x`);
}

// --- MOVEMENT HELPERS ---
function moveCol(delta) {
  const ln = state.lines[state.cursor.row] || '';
  const max = state.mode === 'insert' ? ln.length : Math.max(0, ln.length - 1);
  state.cursor.col = Math.max(0, Math.min(state.cursor.col + delta, max));
}

function moveRow(delta) {
  state.cursor.row = Math.max(0, Math.min(state.cursor.row + delta, state.lines.length - 1));
  clampCursor();
}

function gotoLine(row) {
  state.cursor.row = Math.max(0, Math.min(row, state.lines.length - 1));
  const ln = state.lines[state.cursor.row] || '';
  const firstNonBlank = ln.search(/\S/);
  state.cursor.col = firstNonBlank >= 0 ? firstNonBlank : 0;
}

function clampCursor() {
  const ln = state.lines[state.cursor.row] || '';
  const max = state.mode === 'insert' ? ln.length : Math.max(0, ln.length - 1);
  state.cursor.col = Math.max(0, Math.min(state.cursor.col, max));
}

function visibleRows() {
  return Math.floor(document.getElementById('editor-lines').clientHeight / 21) || 10;
}

function moveToLastNonBlank() {
  const ln = state.lines[state.cursor.row] || '';
  let c = ln.length - 1;
  while (c > 0 && /\s/.test(ln[c])) c--;
  state.cursor.col = Math.max(0, c);
}

// --- WORD MOTIONS ---
function motionWordFwd(big) {
  let { row, col } = state.cursor;
  let ln = state.lines[row] || '';
  const isW = big ? c => !/\s/.test(c) : c => /\w/.test(c);
  col++;
  while (col < ln.length && isW(ln[col])) col++;
  while (col < ln.length && /\s/.test(ln[col])) col++;
  if (col >= ln.length && row < state.lines.length - 1) { row++; col = 0; }
  state.cursor = { row, col: Math.min(col, Math.max(0, (state.lines[row]||'').length - 1)) };
}

function motionWordBwd(big) {
  let { row, col } = state.cursor;
  const isNW = big ? c => /\s/.test(c) : c => !/\w/.test(c);
  col--;
  if (col < 0) { if (row > 0) { row--; col = Math.max(0, state.lines[row].length - 1); } else { col = 0; state.cursor = {row,col}; return; } }
  const ln = state.lines[row] || '';
  while (col > 0 && /\s/.test(ln[col])) col--;
  while (col > 0 && !isNW(ln[col-1])) col--;
  state.cursor = { row, col: Math.max(0, col) };
}

function motionWordEnd(big) {
  let { row, col } = state.cursor;
  let ln = state.lines[row] || '';
  const isW = big ? c => !/\s/.test(c) : c => /\w/.test(c);
  col++;
  if (col >= ln.length) { if (row < state.lines.length - 1) { row++; col = 0; } else return; }
  ln = state.lines[row] || '';
  while (col < ln.length - 1 && /\s/.test(ln[col])) col++;
  while (col < ln.length - 1 && isW(ln[col+1])) col++;
  state.cursor = { row, col: Math.max(0, col) };
}

function motionGe(big) {
  let { row, col } = state.cursor;
  const isNW = big ? c => /\s/.test(c) : c => !/\w/.test(c);
  col--;
  if (col < 0) { if (row > 0) { row--; col = Math.max(0, state.lines[row].length - 1); } else { col = 0; state.cursor={row,col}; return; } }
  const ln = state.lines[row] || '';
  while (col > 0 && /\s/.test(ln[col])) col--;
  while (col > 0 && !isNW(ln[col-1])) { if (!isNW(ln[col-1])) col--; else break; }
  state.cursor = { row, col: Math.max(0, col) };
}

// --- f/t JUMPS ---
function fJump(ch, forward, before) {
  const ln = state.lines[state.cursor.row] || '';
  if (forward) {
    const idx = ln.indexOf(ch, state.cursor.col + 1);
    if (idx !== -1) state.cursor.col = before ? Math.max(state.cursor.col, idx - 1) : idx;
  } else {
    const idx = ln.lastIndexOf(ch, state.cursor.col - 1);
    if (idx !== -1) state.cursor.col = before ? Math.min(state.cursor.col, idx + 1) : idx;
  }
}

function repeatFt(same, count = 1) {
  const { cmd, ch } = state.lastFt;
  for (let i = 0; i < count; i++) {
    const forward = same ? 'fFtT'.indexOf(cmd) % 2 === 0 : 'fFtT'.indexOf(cmd) % 2 !== 0;
    const before = cmd === 't' || cmd === 'T';
    fJump(ch, forward, before);
  }
}

function finishOpAtCursor(op) {
  state.submode = 'normal';
  state.pendingOp = null;
}

// --- BRACKET MATCHING ---
function jumpMatchingBracket() {
  const ln = state.lines[state.cursor.row] || '';
  const ch = ln[state.cursor.col];
  const pairs = {'(':')',')':'(','[':']',']':'[','{':'}','}':'{'};
  if (!pairs[ch]) return;
  const forward = '([{'.includes(ch);
  const target = pairs[ch];
  let depth = 0;
  if (forward) {
    for (let c = state.cursor.col; c < ln.length; c++) {
      if (ln[c] === ch) depth++;
      else if (ln[c] === target) { if (--depth === 0) { state.cursor.col = c; return; } }
    }
  } else {
    for (let c = state.cursor.col; c >= 0; c--) {
      if (ln[c] === ch) depth++;
      else if (ln[c] === target) { if (--depth === 0) { state.cursor.col = c; return; } }
    }
  }
}

// --- SEARCH ---
function nextMatch(dir) {
  if (!state.searchQuery) return;
  const q = state.searchQuery;
  const { row, col } = state.cursor;
  const n = state.lines.length;

  if (dir > 0) {
    for (let r = row; r < n; r++) {
      const start = r === row ? col + 1 : 0;
      const idx = state.lines[r].indexOf(q, start);
      if (idx !== -1) { state.cursor = {row: r, col: idx}; return; }
    }
    for (let r = 0; r <= row; r++) {
      const idx = state.lines[r].indexOf(q);
      if (idx !== -1) { state.cursor = {row: r, col: idx}; flashMessage('search wrapped'); return; }
    }
  } else {
    for (let r = row; r >= 0; r--) {
      const end = r === row ? col : state.lines[r].length;
      const ln = state.lines[r].slice(0, end);
      const idx = ln.lastIndexOf(q);
      if (idx !== -1) { state.cursor = {row: r, col: idx}; return; }
    }
    for (let r = n - 1; r >= row; r--) {
      const idx = state.lines[r].lastIndexOf(q);
      if (idx !== -1) { state.cursor = {row: r, col: idx}; flashMessage('search wrapped'); return; }
    }
  }
}

function searchWord(dir) {
  const ln = state.lines[state.cursor.row] || '';
  const col = state.cursor.col;
  const before = ln.slice(0, col + 1).match(/\w+$/);
  if (!before) return;
  const after = ln.slice(col).match(/^\w*/);
  const word = before[0].slice(0, -after[0].length) + after[0];
  const m = ln.slice(0, col + 1).match(/\w+$/);
  if (!m) return;
  const start = col + 1 - m[0].length;
  const rest = ln.slice(start).match(/^\w+/);
  if (rest) { state.searchQuery = rest[0]; state.searchDir = dir; nextMatch(dir); }
}

// --- INDENT HELPERS ---
function indentRange(r1, r2, dir) {
  for (let r = r1; r <= Math.min(r2, state.lines.length-1); r++) {
    if (dir > 0) state.lines[r] = '  ' + state.lines[r];
    else state.lines[r] = state.lines[r].replace(/^  /, '');
  }
}

function autoIndentRange(r1, r2) {
  for (let r = r1; r <= Math.min(r2, state.lines.length-1); r++) {
    let refRow = r - 1;
    while (refRow > 0 && state.lines[refRow].trim() === '') refRow--;
    const ref = state.lines[refRow] || '';
    const indent = (ref.match(/^(\s*)/) || ['',''])[1];
    state.lines[r] = indent + state.lines[r].trimStart();
  }
}

function getAutoIndent(row) {
  const ln = state.lines[row] || '';
  return (ln.match(/^(\s*)/) || ['',''])[1];
}

// --- LINE OPERATIONS ---
function deleteLine(row) {
  saveUndo();
  const removed = state.lines.splice(row, 1);
  state.clipboard = { type: 'line', text: removed[0] };
  if (state.lines.length === 0) state.lines = [''];
  state.cursor.row = Math.min(row, state.lines.length - 1);
  clampCursor();
}

function yankLines(row, count) {
  const text = state.lines.slice(row, row + count).join('\n');
  state.clipboard = { type: 'line', text };
  flashMessage(`${count} line${count>1?'s':''} yanked`);
}

// --- PASTE ---
function paste(after, count) {
  saveUndo();
  for (let i = 0; i < count; i++) {
    if (state.clipboard.type === 'line') {
      const newLines = state.clipboard.text.split('\n');
      const at = after ? state.cursor.row + 1 : state.cursor.row;
      state.lines.splice(at, 0, ...newLines);
      state.cursor.row = at;
      state.cursor.col = 0;
    } else {
      const ln = state.lines[state.cursor.row] || '';
      const pos = after ? state.cursor.col + 1 : state.cursor.col;
      const clipped = Math.min(pos, ln.length);
      state.lines[state.cursor.row] = ln.slice(0, clipped) + state.clipboard.text + ln.slice(clipped);
      state.cursor.col = clipped + state.clipboard.text.length - 1;
    }
  }
}

// --- UNDO/REDO ---
function saveUndo() {
  state.undoStack.push({ lines: state.lines.map(l=>l), cursor: {...state.cursor} });
  if (state.undoStack.length > 200) state.undoStack.shift();
  state.redoStack = [];
}

function undo() {
  if (!state.undoStack.length) { flashMessage('Already at oldest change'); return; }
  state.redoStack.push({ lines: state.lines.map(l=>l), cursor: {...state.cursor} });
  const snap = state.undoStack.pop();
  state.lines = snap.lines;
  state.cursor = snap.cursor;
  clampCursor();
  state.undoCount++;
}

function redo() {
  if (!state.redoStack.length) { flashMessage('Already at newest change'); return; }
  state.undoStack.push({ lines: state.lines.map(l=>l), cursor: {...state.cursor} });
  const snap = state.redoStack.pop();
  state.lines = snap.lines;
  state.cursor = snap.cursor;
  clampCursor();
  state.redoCount++;
}

// --- DOT REPEAT ---
let lastAction = null;
function dotRepeat() {
  flashMessage('. (dot repeat — limited in browser)');
}

// --- TOGGLE CASE MOTIONS ---
function toggleCaseMotion() {
  const ln = state.lines[state.cursor.row];
  if (!ln) return;
  state.lines[state.cursor.row] = ln.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
}
function lowercaseMotion() {
  state.lines[state.cursor.row] = (state.lines[state.cursor.row] || '').toLowerCase();
}
function uppercaseMotion() {
  state.lines[state.cursor.row] = (state.lines[state.cursor.row] || '').toUpperCase();
}

// --- COUNT HELPER ---
function consumeCount() {
  const n = state.countStr ? parseInt(state.countStr, 10) : 1;
  state.countStr = '';
  if (n > 1) state.usedCountPrefix = true;
  return Math.max(1, n);
}

// --- EXERCISE GOAL CHECKING ---
function checkGoal() {
  const ex = EXERCISES[currentExercise];
  if (ex.check(state) && !completedExercises.has(currentExercise)) {
    completedExercises.add(currentExercise);
    showSuccessFlash();
    updateSidebarCompletion(currentExercise);
    updateProgressBar();
    setTimeout(() => {
      if (currentExercise < EXERCISES.length - 1) loadExercise(currentExercise + 1);
    }, 1600);
  }
}

function showSuccessFlash() {
  const el = document.getElementById('success-flash');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1500);
}

function updateSidebarCompletion(idx) {
  const item = document.querySelectorAll('.exercise-item')[idx];
  if (item && !item.querySelector('.check')) {
    item.querySelector('.exercise-title').insertAdjacentHTML('beforeend', '<span class="check"> ✓</span>');
    item.classList.add('completed');
  }
}

function updateProgressBar() {
  const pct = Math.round((completedExercises.size / (EXERCISES.length - 1)) * 100);
  const bar = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = `${completedExercises.size}/${EXERCISES.length - 1}`;
}

// --- UI HELPERS ---
function switchTab(tab) {
  document.querySelectorAll('.sidebar-tab').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  document.getElementById('tab-exercises').style.display = tab === 'exercises' ? '' : 'none';
  document.getElementById('tab-reference').style.display  = tab === 'reference'  ? '' : 'none';
}

// --- BOOT ---
document.addEventListener('DOMContentLoaded', () => {
  loadExercise(0);
  const editor = document.getElementById('vim-editor');
  editor.addEventListener('keydown', handleKey);
  editor.addEventListener('click', () => editor.focus());
  editor.focus();
  updateProgressBar();
});
