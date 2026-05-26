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
    difficulty: 1,
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
    difficulty: 1,
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
    difficulty: 1,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 3,
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
  {
    category: "Navigation",
    title: "Paragraph Jumps: { and }",
    difficulty: 2,
    filename: "paragraphs.txt",
    goal: "Jump to the next paragraph with <span class='goal'>}</span> then back with <span class='goal'>{</span>.",
    hint: "<kbd>}</kbd> jumps to the next blank line. <kbd>{</kbd> jumps to the previous blank line.",
    content: [
      "First paragraph, first line.",
      "First paragraph, second line.",
      "",
      "Second paragraph starts here.",
      "It also has multiple lines.",
      "",
      "Third paragraph — use } to reach here, then { to go back."
    ],
    check: (s) => s.usedParagraphJump
  },
  {
    category: "Navigation",
    title: "Backward Word End: ge",
    difficulty: 3,
    filename: "ge_motion.txt",
    goal: "Navigate backward to word ends using <span class='goal'>ge</span>.",
    hint: "<kbd>ge</kbd> moves to the end of the previous word. Unlike <kbd>b</kbd>, it stops at word ends, not starts.",
    content: [
      "apple banana cherry date elderberry fig grape",
      "ge stops at word ENDS while moving left",
      "b stops at word STARTS — try both and feel the difference"
    ],
    check: (s) => s.usedGeMotion
  },
  {
    category: "Navigation",
    title: "Navigation Challenge",
    difficulty: 4,
    filename: "navchallenge.txt",
    goal: "Reach the word <span class='goal'>GOAL</span> on the last line using efficient motions.",
    hint: "Combine <kbd>G</kbd>, <kbd>}</kbd>, <kbd>w</kbd>, <kbd>f</kbd>. Avoid spamming hjkl.",
    content: [
      "Start here at the top of the file.",
      "Line two: alpha beta gamma delta epsilon",
      "",
      "New section after the blank line.",
      "More words: zeta eta theta iota kappa lambda",
      "",
      "Final section — navigate here efficiently.",
      "The word GOAL is somewhere on this line."
    ],
    check: (s) => {
      const line = s.lines[s.cursor.row] || '';
      const idx = line.indexOf('GOAL');
      return idx >= 0 && s.cursor.col >= idx && s.cursor.col <= idx + 3;
    }
  },

  // ── INSERT & EDIT ─────────────────────────────────────────────────────────
  {
    category: "Insert & Edit",
    title: "Insert Mode: i, o",
    difficulty: 1,
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
    difficulty: 1,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 3,
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
  {
    category: "Insert & Edit",
    title: "Change Line: cc",
    difficulty: 2,
    filename: "cc_change.txt",
    goal: "Replace entire lines using <span class='goal'>cc</span>.",
    hint: "<kbd>cc</kbd> clears the current line and enters Insert mode, keeping indentation.",
    content: [
      "REPLACE THIS LINE with something new.",
      "  REPLACE THIS INDENTED LINE too.",
      "Leave this line alone.",
      "",
      "Use cc on lines 1 and 2 to overwrite their content."
    ],
    check: (s) => s.usedCC &&
                  !s.lines[0].includes("REPLACE") &&
                  s.lines[2] === "Leave this line alone."
  },
  {
    category: "Insert & Edit",
    title: "Delete Word in Insert: Ctrl+W",
    difficulty: 2,
    filename: "ctrlw.txt",
    goal: "In Insert mode, delete the previous word with <span class='goal'>Ctrl+W</span>.",
    hint: "Press <kbd>A</kbd> to enter insert at EOL, type a word, then <kbd>Ctrl+W</kbd> to erase it.",
    content: [
      "Append to this line: type a word then Ctrl+W to delete it.",
      "This beats holding Backspace one char at a time.",
      "Ctrl+W deletes back to the previous whitespace boundary."
    ],
    check: (s) => s.usedCtrlWInsert
  },
  {
    category: "Insert & Edit",
    title: "Fill the Template",
    difficulty: 4,
    filename: "template.txt",
    goal: "Replace all <span class='goal'>___</span> placeholders with real text.",
    hint: "Use <kbd>f_</kbd> to jump to each placeholder, then <kbd>cw</kbd> or <kbd>ciw</kbd> to replace it.",
    content: [
      "Name:  ___",
      "Email: ___",
      "Role:  ___",
      "Team:  ___",
      "",
      "Replace every ___ above. Use f_ then cw for efficiency."
    ],
    check: (s) => !s.lines.some(l => l.includes("___"))
  },

  // ── DELETE & CHANGE ───────────────────────────────────────────────────────
  {
    category: "Delete & Change",
    title: "Delete Lines: dd",
    difficulty: 1,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 3,
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
  {
    category: "Delete & Change",
    title: "Count Delete: 3dd",
    difficulty: 2,
    filename: "count_delete.txt",
    goal: "Delete exactly <span class='goal'>3 lines at once</span> using a count prefix with <kbd>dd</kbd>.",
    hint: "Type <kbd>3dd</kbd> to delete 3 lines in one command. Much faster than repeating dd.",
    content: [
      "Keep this line.",
      "DELETE LINE A",
      "DELETE LINE B",
      "DELETE LINE C",
      "Keep this line too.",
      "And this one."
    ],
    check: (s) => s.usedCountPrefix &&
                  !s.lines.some(l => l.startsWith("DELETE LINE"))
  },
  {
    category: "Delete & Change",
    title: "Delete to End of File: dG",
    difficulty: 3,
    filename: "dG.txt",
    goal: "Delete from the marked line to the end of the file using <span class='goal'>dG</span>.",
    hint: "Position cursor on the first line to delete, then press <kbd>dG</kbd> to delete to EOF.",
    content: [
      "Keep this line.",
      "Keep this line too.",
      "=== DELETE FROM HERE TO END ===",
      "This line should go.",
      "This one too.",
      "And this one.",
      "All of these must be deleted."
    ],
    check: (s) => s.lines.length === 2 &&
                  s.lines[0] === "Keep this line." &&
                  s.lines[1] === "Keep this line too."
  },
  {
    category: "Delete & Change",
    title: "Expert Edit: Rewrite the Function",
    difficulty: 5,
    filename: "rewrite.txt",
    goal: "Replace the entire function body — delete the old lines and type new ones.",
    hint: "Use <kbd>dG</kbd> or <kbd>dd</kbd> to clear the body, then <kbd>o</kbd> to add new lines. Or use <kbd>cc</kbd> on each line.",
    content: [
      "function greet(name) {",
      "  console.log('WRONG: ' + name);",
      "  return 'WRONG';",
      "}",
      "",
      "Rewrite the body so it returns 'Hello, ' + name"
    ],
    check: (s) => s.lines.some(l => l.includes("Hello")) &&
                  !s.lines.some(l => l.includes("WRONG"))
  },

  // ── YANK & PASTE ──────────────────────────────────────────────────────────
  {
    category: "Yank & Paste",
    title: "Yank & Paste: yy, p",
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 3,
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
  {
    category: "Yank & Paste",
    title: "Yank to End of File: yG",
    difficulty: 3,
    filename: "yG.txt",
    goal: "Yank from the marked line to EOF with <span class='goal'>yG</span>, then paste elsewhere.",
    hint: "Put cursor on the line to start yanking, press <kbd>yG</kbd>, move up, then <kbd>P</kbd> to paste.",
    content: [
      "=== PASTE TARGET: paste the block above this line ===",
      "",
      "Yank from here:",
      "Line A",
      "Line B",
      "Line C"
    ],
    check: (s) => {
      const targetIdx = s.lines.findIndex(l => l.includes("PASTE TARGET"));
      return targetIdx > 0 && s.lines[targetIdx - 1].includes("Line");
    }
  },
  {
    category: "Yank & Paste",
    title: "Paste Multiple Times: 3p",
    difficulty: 3,
    filename: "paste_count.txt",
    goal: "Yank a line then paste it <span class='goal'>3 times</span> using a count before <kbd>p</kbd>.",
    hint: "Yank with <kbd>yy</kbd>, then type <kbd>3p</kbd> to paste 3 copies at once.",
    content: [
      "DUPLICATE ME — yank this line with yy",
      "",
      "Paste 3 copies below this line using 3p."
    ],
    check: (s) => s.lines.filter(l => l.includes("DUPLICATE ME")).length >= 4
  },

  // ── VISUAL MODE ───────────────────────────────────────────────────────────
  {
    category: "Visual Mode",
    title: "Visual Line: V + d",
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 3,
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
    difficulty: 3,
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
  {
    category: "Visual Mode",
    title: "Visual Change: v + c",
    difficulty: 3,
    filename: "vchange.txt",
    goal: "Select the word <span class='goal'>REPLACE_ME</span> with <kbd>v</kbd> then change it with <kbd>c</kbd>.",
    hint: "Press <kbd>v</kbd>, use <kbd>w</kbd> or <kbd>e</kbd> to select, then <kbd>c</kbd> to change the selection.",
    content: [
      "The value REPLACE_ME should be updated.",
      "Also fix REPLACE_ME on this line too.",
      "",
      "Use v+w+c to select and replace each REPLACE_ME."
    ],
    check: (s) => !s.lines.some(l => l.includes("REPLACE_ME"))
  },
  {
    category: "Visual Mode",
    title: "Visual Block: Ctrl+V",
    difficulty: 3,
    filename: "vblock.txt",
    goal: "Use <span class='goal'>Ctrl+V</span> to select a column of characters and delete them.",
    hint: "Press <kbd>Ctrl+V</kbd>, extend selection with <kbd>j</kbd>, then <kbd>d</kbd> to delete the column.",
    content: [
      "| apple  | red   |",
      "| banana | yellow|",
      "| cherry | red   |",
      "| date   | brown |",
      "",
      "Delete the leading '| ' column using Ctrl+V, j, j, j, d."
    ],
    check: (s) => !s.lines[0].startsWith("| ") &&
                  !s.lines[1].startsWith("| ") &&
                  !s.lines[2].startsWith("| ")
  },
  {
    category: "Visual Mode",
    title: "Select All and Indent: ggVG>",
    difficulty: 4,
    filename: "indent_all.txt",
    goal: "Select the entire file with <span class='goal'>ggVG</span> then indent with <span class='goal'>></span>.",
    hint: "<kbd>gg</kbd> to top, <kbd>V</kbd> to start line-visual, <kbd>G</kbd> to extend to bottom, <kbd>></kbd> to indent.",
    content: [
      "function setup() {",
      "const x = 1;",
      "const y = 2;",
      "return x + y;",
      "}"
    ],
    check: (s) => s.lines.every((l, i) => i === 0 || l.startsWith("  ") || l === "}")
  },

  // ── TEXT OBJECTS ──────────────────────────────────────────────────────────
  {
    category: "Text Objects",
    title: "Text Objects: ci\"",
    difficulty: 2,
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
    difficulty: 3,
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
    difficulty: 3,
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
    difficulty: 3,
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
    difficulty: 3,
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
  {
    category: "Text Objects",
    title: "Change Inside Brackets: ci[",
    difficulty: 3,
    filename: "ci_bracket.txt",
    goal: "Change the contents inside <span class='goal'>[]</span> brackets using <kbd>ci[</kbd>.",
    hint: "Put cursor anywhere inside or on a bracket, then type <kbd>ci[</kbd> to delete contents and enter Insert.",
    content: [
      "const colors = [\"red\", \"green\", \"blue\"];",
      "let items = [1, 2, 3, 4, 5];",
      "var flags = [true, false, true];",
      "",
      "Use ci[ to replace each array's contents."
    ],
    check: (s) => !s.lines[0].includes("\"red\"") &&
                  !s.lines[1].includes("1, 2, 3")
  },
  {
    category: "Text Objects",
    title: "Change Around Parens: ca(",
    difficulty: 4,
    filename: "ca_paren.txt",
    goal: "Delete a function call including its parentheses using <span class='goal'>ca(</span>.",
    hint: "<kbd>ca(</kbd> deletes the text AND the surrounding parens. <kbd>ci(</kbd> keeps the parens.",
    content: [
      "result = compute(old_value) + extra;",
      "output = transform(bad_input) * factor;",
      "final = process(wrong_data);",
      "",
      "Use ca( to delete each function call including parens, then retype."
    ],
    check: (s) => !s.lines[0].includes("compute(old_value)") &&
                  !s.lines[1].includes("transform(bad_input)")
  },
  {
    category: "Text Objects",
    title: "Nested Text Objects",
    difficulty: 5,
    filename: "nested_obj.txt",
    goal: "Change the inner string in <span class='goal'>nested quotes</span> without touching the outer structure.",
    hint: "Use <kbd>ci\"</kbd> to target just the inner string. Navigate precisely with <kbd>f\"</kbd> first.",
    content: [
      "const msg = \"Error: 'CHANGE THIS' occurred\";",
      "log(\"Warning: 'CHANGE THIS TOO' found\");",
      "throw new Error(\"Fatal: 'AND THIS' failed\");",
      "",
      "Change each single-quoted phrase inside the double-quoted strings."
    ],
    check: (s) => !s.lines.some(l => l.includes("CHANGE THIS"))
  },

  // ── SEARCH & REPLACE ──────────────────────────────────────────────────────
  {
    category: "Search & Replace",
    title: "Search Forward: /",
    difficulty: 2,
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
    difficulty: 2,
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
    difficulty: 3,
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
    difficulty: 3,
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
  {
    category: "Search & Replace",
    title: "Backward Search: ?",
    difficulty: 2,
    filename: "bsearch.txt",
    goal: "Search <span class='goal'>backward</span> for the word 'mark' using <kbd>?</kbd>.",
    hint: "Type <kbd>?mark</kbd> then Enter to search backward. Press <kbd>N</kbd> to continue backward.",
    content: [
      "The first mark is at the top.",
      "Some text in the middle.",
      "Another mark is here in the middle.",
      "More text below.",
      "Start here — search backward for 'mark' using ?mark"
    ],
    check: (s) => s.usedBackwardSearch
  },
  {
    category: "Search & Replace",
    title: "Navigate Matches: n and N",
    difficulty: 3,
    filename: "nav_search.txt",
    goal: "Search for 'TODO' then cycle through all matches using <span class='goal'>n</span> and <span class='goal'>N</span>.",
    hint: "<kbd>/TODO</kbd> to search, <kbd>n</kbd> for next match, <kbd>N</kbd> for previous. Reach all 5 TODOs.",
    content: [
      "TODO: fix the login bug",
      "This line is fine.",
      "TODO: add input validation",
      "Another normal line.",
      "TODO: write unit tests",
      "More normal content here.",
      "TODO: update documentation",
      "Almost done.",
      "TODO: deploy to staging"
    ],
    check: (s) => s.nPresses >= 4
  },
  {
    category: "Search & Replace",
    title: "Complex Substitution",
    difficulty: 5,
    filename: "complex_sub.txt",
    goal: "Transform all function calls from <span class='goal'>old_api(x)</span> to <span class='goal'>new_api(x)</span> using <kbd>:%s</kbd>.",
    hint: "Use <kbd>:%s/old_api/new_api/g</kbd> to replace all occurrences across the file.",
    content: [
      "const a = old_api(getData());",
      "const b = old_api(transform(x));",
      "log(old_api(result));",
      "return old_api(value) || old_api(fallback);",
      "",
      "Replace every old_api call with new_api using :%s/old_api/new_api/g"
    ],
    check: (s) => !s.lines.some(l => l.includes("old_api")) &&
                  s.lines.some(l => l.includes("new_api"))
  },

  // ── UNDO & REPEAT ─────────────────────────────────────────────────────────
  {
    category: "Undo & Repeat",
    title: "Undo & Redo: u, Ctrl+r",
    difficulty: 2,
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
  {
    category: "Undo & Repeat",
    title: "Dot Repeat: .",
    difficulty: 2,
    filename: "dot_repeat.txt",
    goal: "Make a change then press <span class='goal'>.</span> to repeat it.",
    hint: "<kbd>.</kbd> repeats your last change. Try <kbd>dd</kbd> to delete a line, then <kbd>j.</kbd> to delete the next.",
    content: [
      "Keep this line.",
      "DELETE ME",
      "Keep this too.",
      "DELETE ME",
      "And keep this.",
      "DELETE ME"
    ],
    check: (s) => s.usedDotRepeat
  },
  {
    category: "Undo & Repeat",
    title: "Multiple Undo",
    difficulty: 3,
    filename: "multi_undo.txt",
    goal: "Make 3 changes, then undo all of them with <span class='goal'>u</span> to restore the file.",
    hint: "Make changes (delete lines, edit words), then press <kbd>u</kbd> three times to undo each one.",
    content: [
      "Original line one.",
      "Original line two.",
      "Original line three.",
      "",
      "Make changes to lines 1-3, then undo them all."
    ],
    check: (s) => s.undoCount >= 3 &&
                  s.lines[0] === "Original line one." &&
                  s.lines[1] === "Original line two." &&
                  s.lines[2] === "Original line three."
  },
  {
    category: "Undo & Repeat",
    title: "Undo Tree Navigation",
    difficulty: 4,
    filename: "undo_tree.txt",
    goal: "Make changes, undo several times, redo with <span class='goal'>Ctrl+r</span>, then undo again.",
    hint: "Undo with <kbd>u</kbd>, redo with <kbd>Ctrl+r</kbd>. Goal: undo 3 times and redo 2 times.",
    content: [
      "Start with this text.",
      "Make edits here.",
      "And here too.",
      "And on this line.",
      "",
      "Edit lines 2-4, then undo/redo to navigate your change history."
    ],
    check: (s) => s.undoCount >= 3 && s.redoCount >= 2
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    category: "Advanced",
    title: "Indentation: >>, <<",
    difficulty: 3,
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
    difficulty: 3,
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
    difficulty: 2,
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
    difficulty: 4,
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
  {
    category: "Advanced",
    title: "Marks: ma and 'a",
    difficulty: 4,
    filename: "marks.txt",
    goal: "Set a mark with <span class='goal'>ma</span>, navigate far away, then jump back with <span class='goal'>'a</span>.",
    hint: "<kbd>ma</kbd> sets mark 'a' at the cursor. <kbd>'a</kbd> jumps back to that line.",
    content: [
      "=== SET YOUR MARK HERE with ma ===",
      "Line 2", "Line 3", "Line 4", "Line 5",
      "Line 6", "Line 7", "Line 8", "Line 9",
      "Navigate far away (press G), then press 'a to return to your mark."
    ],
    check: (s) => s.usedMark
  },
  {
    category: "Advanced",
    title: "Power Macro",
    difficulty: 5,
    filename: "power_macro.txt",
    goal: "Record a macro to transform one line, then replay it on <span class='goal'>all 5 lines</span>.",
    hint: "<kbd>qa</kbd> to record, transform the first line, <kbd>q</kbd> to stop. Then <kbd>4@a</kbd> to replay 4 times.",
    content: [
      "item: apple",
      "item: banana",
      "item: cherry",
      "item: date",
      "item: elderberry",
      "",
      "Transform each line so 'item: ' becomes '- [ ] ' (a checklist)."
    ],
    check: (s) => s.macroPlayed &&
                  s.lines.slice(0, 5).every(l => !l.startsWith("item:"))
  },
  {
    category: "Advanced",
    title: "Expert Refactor",
    difficulty: 5,
    filename: "expert.txt",
    goal: "Transform the entire file: fix names, remove comments, reformat output lines.",
    hint: "Use <kbd>:%s</kbd> for global replacements, <kbd>dd</kbd> for deletions, <kbd>ciw</kbd> for targeted edits.",
    content: [
      "// TODO: remove this comment",
      "var badName = 'hello';",
      "// TODO: remove this too",
      "var anotherBad = 42;",
      "console.log('DEBUG: ' + badName);",
      "console.log('DEBUG: ' + anotherBad);"
    ],
    check: (s) => !s.lines.some(l => l.startsWith("//")) &&
                  !s.lines.some(l => l.includes("badName")) &&
                  !s.lines.some(l => l.includes("DEBUG:"))
  },

  // ── FREE PRACTICE ─────────────────────────────────────────────────────────
  {
    category: "Free Practice",
    title: "Free Practice",
    difficulty: 0,
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

    // Additional tracking flags
    usedParagraphJump: false,
    usedGeMotion: false,
    usedCC: false,
    usedBackwardSearch: false,
    usedCtrlWInsert: false,
    usedDotRepeat: false,
    usedMark: false,
    marks: {},
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
  document.querySelectorAll('.exercise-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.ex) === idx);
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
  if (state.submode === 'mark_set') { el.textContent = 'm'; return; }
  if (state.submode === 'mark_jump') { el.textContent = "'"; return; }
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
    else if (key === 'e') { for (let i=0;i<count;i++) motionGe(); state.usedGeMotion = true; }
    else if (key === 'E') { for (let i=0;i<count;i++) motionGe(true); state.usedGeMotion = true; }
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

  // --- Sub-state: mark set (m{letter}) ---
  if (state.submode === 'mark_set') {
    state.submode = 'normal';
    if (/^[a-z]$/.test(key)) {
      state.marks[key] = { row: state.cursor.row, col: state.cursor.col };
    }
    return;
  }

  // --- Sub-state: mark jump ('{letter}) ---
  if (state.submode === 'mark_jump') {
    state.submode = 'normal';
    if (/^[a-z]$/.test(key) && state.marks[key]) {
      state.cursor.row = state.marks[key].row;
      state.cursor.col = state.marks[key].col;
      state.usedMark = true;
      clampCursor();
    }
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
    case '{': jumpParagraphBwd(); state.usedParagraphJump = true; break;
    case '}': jumpParagraphFwd(); state.usedParagraphJump = true; break;
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
    case '?': state.mode = 'search'; state.searchDir = -1; state.cmdBuffer = ''; state.usedBackwardSearch = true; break;
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
    case 'm': state.submode = 'mark_set'; break;
    case "'": state.submode = 'mark_jump'; break;

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
    else if (op === 'c') { saveUndo(); for(let i=0;i<count;i++) deleteLine(state.cursor.row); state.mode = 'insert'; state.cursor.col = 0; state.usedCC = true; }
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
  if (key === 'C-w') {
    const r = state.cursor.row;
    const ln = state.lines[r] || '';
    let c = state.cursor.col;
    while (c > 0 && /\s/.test(ln[c - 1])) c--;
    while (c > 0 && /\S/.test(ln[c - 1])) c--;
    state.lines[r] = ln.slice(0, c) + ln.slice(state.cursor.col);
    state.cursor.col = c;
    state.usedCtrlWInsert = true;
    return;
  }

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

// --- PARAGRAPH MOTIONS ---
function jumpParagraphFwd() {
  let r = state.cursor.row + 1;
  while (r < state.lines.length && state.lines[r].trim() !== '') r++;
  state.cursor.row = Math.min(r, state.lines.length - 1);
  clampCursor();
}

function jumpParagraphBwd() {
  let r = state.cursor.row - 1;
  while (r > 0 && state.lines[r].trim() !== '') r--;
  state.cursor.row = Math.max(0, r);
  clampCursor();
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
  state.usedDotRepeat = true;
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
  document.querySelectorAll(`.exercise-item[data-ex="${idx}"]`).forEach(item => {
    if (!item.querySelector('.check')) {
      item.querySelector('.exercise-title').insertAdjacentHTML('beforeend', '<span class="check"> ✓</span>');
      item.classList.add('completed');
    }
  });
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
  document.getElementById('tab-category').style.display  = tab === 'category'  ? '' : 'none';
  document.getElementById('tab-level').style.display     = tab === 'level'     ? '' : 'none';
  document.getElementById('tab-reference').style.display = tab === 'reference' ? '' : 'none';
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
