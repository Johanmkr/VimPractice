// =============================================
// Keystroke Arcade — Level & World Data
// =============================================

const WORLDS = [
  { id: 'motion-mines', name: 'Motion Mines', order: 1, blurb: 'A minefield of motions — every wasted keystroke is a trip-wire, every efficient jump defuses another charge.' },
  { id: 'operator-outpost', name: 'Operator Outpost', order: 2, blurb: 'A forward base full of broken text — deploy insert, delete, and change operators to patch it up before it goes dark.' },
  { id: 'text-object-temple', name: 'Text Object Temple', order: 3, blurb: 'An ancient chamber encoded in nested delimiters — only precise inner and around text objects unlock its deeper rooms.' },
];

const LEVELS = [
  {
    id: "motion-mines-1",
    world: "motion-mines",
    worldOrder: 1,
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
    },
    flavor: "Motion Mines control room, day one: the only tools online are h, j, k, l. Ease off the walk-keys and land inside the blast radius of TARGET without triggering a single trip-mine.",
    par: 8,
    unlock: null
  },
  {
    id: "motion-mines-2",
    world: "motion-mines",
    worldOrder: 2,
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
    },
    flavor: "Hjkl is for tunnels — the open field calls for word-hops. Skip straight across the wordlist and touch down on DESTINATION.",
    par: 3,
    unlock: "motion-mines-1"
  },
  {
    id: "motion-mines-3",
    world: "motion-mines",
    worldOrder: 3,
    category: "Navigation",
    title: "File Navigation: gg, G",
    difficulty: 2,
    filename: "bigfile.txt",
    goal: "Jump to the bottom with <span class='goal'>G</span>, then back to the top with <span class='goal'>gg</span>.",
    hint: "Press <kbd>G</kbd> (Shift+g) for last line, <kbd>gg</kbd> for first line.",
    content: [
      "=== TOP OF FILE — you start here ===",
      "Line 2",
      "Line 3",
      "Line 4",
      "Line 5",
      "Line 6",
      "Line 7",
      "Line 8",
      "Line 9",
      "Line 10",
      "Line 11",
      "Line 12",
      "Line 13",
      "Line 14",
      "Line 15",
      "Line 16",
      "Line 17",
      "=== BOTTOM OF FILE — use G to reach here, then gg to return ==="
    ],
    check: (s) => s.visitedTop && s.visitedBottom,
    flavor: "Perimeter check: sweep to the bottom fence with G, confirm the far marker, then snap back to base camp with gg.",
    par: 4,
    unlock: "motion-mines-2"
  },
  {
    id: "motion-mines-4",
    world: "motion-mines",
    worldOrder: 4,
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
    check: (s) => s.fJumpCount >= 2,
    flavor: "Two live wires on this line, both reachable by character-jump only. Fire off a couple of f-jumps to prove you can snipe a single glyph without wasting a step.",
    par: 5,
    unlock: "motion-mines-3"
  },
  {
    id: "motion-mines-5",
    world: "motion-mines",
    worldOrder: 5,
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
    check: (s) => s.usedPercent,
    flavor: "This block is a nest of parens, braces, and brackets — the kind of tangle that swallows careless engineers. One tap of % teleports you straight to the matching partner.",
    par: 3,
    unlock: "motion-mines-4"
  },
  {
    id: "motion-mines-6",
    world: "motion-mines",
    worldOrder: 6,
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
    check: (s) => s.usedGeMotion,
    flavor: "Overshot the target and the mines are behind you now. ge walks back to word ends, not word starts — the one motion that gets you out clean.",
    par: 3,
    unlock: "motion-mines-5"
  },
  {
    id: "motion-mines-7",
    world: "motion-mines",
    worldOrder: 7,
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
    },
    flavor: "Motion Mines' final stretch — no hjkl allowed on this run. Chain your jumps (G, }, w, f) and land on GOAL before the field resets.",
    par: 5,
    unlock: "motion-mines-6"
  },
  {
    id: "operator-outpost-1",
    world: "operator-outpost",
    worldOrder: 1,
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
    check: (s) => s.lines.some(l => l.includes("INSERTED")),
    flavor: "Outpost terminal's missing a log entry. Drop into Insert mode and radio back the word INSERTED so command knows you're online.",
    par: 10,
    unlock: "motion-mines-7"
  },
  {
    id: "operator-outpost-2",
    world: "operator-outpost",
    worldOrder: 2,
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
    check: (s) => !s.lines.some(l => l.includes("DELETE THIS LINE")),
    flavor: "Corrupted lines are flagged DELETE THIS LINE across the outpost log. Line them up in your sights and dd each one out of existence.",
    par: 8,
    unlock: "operator-outpost-1"
  },
  {
    id: "operator-outpost-3",
    world: "operator-outpost",
    worldOrder: 3,
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
    check: (s) => !s.lines.some(l => l.includes("WRONG")),
    flavor: "Every WRONG stamped on this manifest is a live bug report. Swap each one out with cw or ciw — or go nuclear with a substitution if you're feeling efficient.",
    par: 16,
    unlock: "operator-outpost-2"
  },
  {
    id: "operator-outpost-4",
    world: "operator-outpost",
    worldOrder: 4,
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
                  !s.lines[1].startsWith("Sn "),
    flavor: "Someone typo'd the outpost's status file into gibberish. Precision strikes only — r swaps one character at a time without ever leaving Normal mode.",
    par: 22,
    unlock: "operator-outpost-3"
  },
  {
    id: "operator-outpost-5",
    world: "operator-outpost",
    worldOrder: 5,
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
    check: (s) => s.lines.some(l => l.includes("This sentence is") && l.includes("split across")),
    flavor: "The outpost printer jammed mid-sentence, splitting one line into three. J welds broken lines back into a single transmission.",
    par: 2,
    unlock: "operator-outpost-4"
  },
  {
    id: "operator-outpost-6",
    world: "operator-outpost",
    worldOrder: 6,
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
                  !s.lines[1].includes("CHANGE THIS TO SOMETHING NEW"),
    flavor: "Two lines end in garbage data. D cuts it clean from the cursor to the edge of the line, C does the same and reopens the channel for new text.",
    par: 8,
    unlock: "operator-outpost-5"
  },
  {
    id: "operator-outpost-7",
    world: "operator-outpost",
    worldOrder: 7,
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
                  !s.lines.some(l => l.includes("WRONG")),
    flavor: "The outpost's core function is broadcasting WRONG on every channel. Gut the broken body and wire in something that actually says Hello.",
    par: 13,
    unlock: "operator-outpost-6"
  },
  {
    id: "text-object-temple-1",
    world: "text-object-temple",
    worldOrder: 1,
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
    check: (s) => s.usedTextObject,
    flavor: "The temple's outer seal responds to intent, not position — target anything inside a delimiter pair and the door reads it as a valid text object.",
    par: 4,
    unlock: "operator-outpost-7"
  },
  {
    id: "text-object-temple-2",
    world: "text-object-temple",
    worldOrder: 2,
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
    check: (s) => !s.lines.some(l => l.includes("OLDWORD")),
    flavor: "OLDWORD is carved into every inscription in this chamber. ciw erases the whole word from wherever your torch happens to be standing.",
    par: 18,
    unlock: "text-object-temple-1"
  },
  {
    id: "text-object-temple-3",
    world: "text-object-temple",
    worldOrder: 3,
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
    check: (s) => !s.lines.some(l => l.includes("REMOVE")),
    flavor: "Plain dw leaves crumbs of whitespace behind on the temple floor. daw takes the word and its surrounding space in one clean sweep.",
    par: 17,
    unlock: "text-object-temple-2"
  },
  {
    id: "text-object-temple-4",
    world: "text-object-temple",
    worldOrder: 4,
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
      /print\(old_argument\)|greet\(wrong_name\)|calculate\(bad_value\)/.test(l)),
    flavor: "Three sealed alcoves, each guarded by a pair of parentheses and a rotten argument inside. ci( strips the contents without disturbing the stone frame.",
    par: 24,
    unlock: "text-object-temple-3"
  },
  {
    id: "text-object-temple-5",
    world: "text-object-temple",
    worldOrder: 5,
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
    check: (s) => !s.lines.some(l => l.includes("DELETE THIS PARAGRAPH")),
    flavor: "One entire passage of the inscription is corrupted beyond reading. dap doesn't pick at words — it removes the whole paragraph in a single motion.",
    par: 6,
    unlock: "text-object-temple-4"
  },
  {
    id: "text-object-temple-6",
    world: "text-object-temple",
    worldOrder: 6,
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
                  !s.lines[1].includes("transform(bad_input)"),
    flavor: "Deeper in the temple, the frame itself is cursed along with what's inside it. ca( takes the parentheses and their contents together, leaving nothing behind.",
    par: 14,
    unlock: "text-object-temple-5"
  },
  {
    id: "text-object-temple-7",
    world: "text-object-temple",
    worldOrder: 7,
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
    check: (s) => !s.lines.some(l => l.includes("CHANGE THIS")),
    flavor: "The final chamber: quotes nested inside quotes, and only the inner phrase is cursed. Target precisely with ci' and leave the outer structure untouched.",
    par: 16,
    unlock: "text-object-temple-6"
  },
];
