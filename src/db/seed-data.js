// DSA sheet content: chapters -> topics -> problems.
// Edit this file to change the sheet, then reseed (drop the tables or the DB) and run `npm run db:setup`.

const youtube = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

// LeetCode problem: [title, difficulty, slug]
const lc = (article) => ([title, difficulty, slug]) => ({
  title,
  difficulty,
  platform: "LeetCode",
  practice: `https://leetcode.com/problems/${slug}/`,
  youtube: youtube(`${title} leetcode solution`),
  article,
});

// Codeforces problem: [title, difficulty, contestId, index]
const cf = (article) => ([title, difficulty, contest, index]) => ({
  title,
  difficulty,
  platform: "Codeforces",
  practice: `https://codeforces.com/problemset/problem/${contest}/${index}`,
  youtube: youtube(`codeforces ${contest}${index} ${title} solution`),
  article,
});

function topic(title, description, difficulty, article, problems, make = lc) {
  return {
    title,
    description,
    difficulty,
    article,
    youtube: youtube(`${title} data structures and algorithms tutorial`),
    problems: problems.map(make(article)),
  };
}

const ARTICLES = {
  complexity: "https://en.wikipedia.org/wiki/Time_complexity",
  array: "https://en.wikipedia.org/wiki/Array_(data_structure)",
  hashing: "https://en.wikipedia.org/wiki/Hash_table",
  subarray: "https://en.wikipedia.org/wiki/Maximum_subarray_problem",
  twoPointers: "https://www.geeksforgeeks.org/two-pointers-technique/",
  slidingWindow: "https://www.geeksforgeeks.org/window-sliding-technique/",
  binarySearch: "https://cp-algorithms.com/num_methods/binary_search.html",
  linkedList: "https://en.wikipedia.org/wiki/Linked_list",
  stack: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)",
  binaryTree: "https://en.wikipedia.org/wiki/Binary_tree",
  graph: "https://cp-algorithms.com/graph/breadth-first-search.html",
  dp: "https://en.wikipedia.org/wiki/Dynamic_programming",
  lcs: "https://en.wikipedia.org/wiki/Longest_common_subsequence",
};

module.exports = [
  {
    title: "Getting Started",
    description: "Warm up with implementation problems and learn to reason about time complexity.",
    topics: [
      topic(
        "Basic Implementation",
        "Read input, simulate, and get comfortable with an online judge.",
        "Easy",
        ARTICLES.complexity,
        [
          ["Watermelon", "Easy", 4, "A"],
          ["Way Too Long Words", "Easy", 71, "A"],
          ["Team", "Easy", 231, "A"],
          ["Theatre Square", "Easy", 1, "A"],
        ],
        cf
      ),
    ],
  },
  {
    title: "Arrays & Hashing",
    description: "The foundation of almost every interview problem.",
    topics: [
      topic("Array Basics", "Traversal, prefix/suffix products and one-pass tricks.", "Easy", ARTICLES.array, [
        ["Two Sum", "Easy", "two-sum"],
        ["Best Time to Buy and Sell Stock", "Easy", "best-time-to-buy-and-sell-stock"],
        ["Contains Duplicate", "Easy", "contains-duplicate"],
        ["Product of Array Except Self", "Medium", "product-of-array-except-self"],
      ]),
      topic("Hashing", "Hash maps and sets for O(1) lookups and frequency counting.", "Medium", ARTICLES.hashing, [
        ["Valid Anagram", "Easy", "valid-anagram"],
        ["Group Anagrams", "Medium", "group-anagrams"],
        ["Top K Frequent Elements", "Medium", "top-k-frequent-elements"],
        ["Longest Consecutive Sequence", "Medium", "longest-consecutive-sequence"],
      ]),
      topic("Subarrays & Kadane's Algorithm", "Maximum subarray and prefix-sum techniques.", "Medium", ARTICLES.subarray, [
        ["Maximum Subarray", "Medium", "maximum-subarray"],
        ["Subarray Sum Equals K", "Medium", "subarray-sum-equals-k"],
        ["Maximum Product Subarray", "Medium", "maximum-product-subarray"],
      ]),
    ],
  },
  {
    title: "Two Pointers & Sliding Window",
    description: "Turn O(n^2) scans into linear passes.",
    topics: [
      topic("Two Pointers", "Move two indices towards each other or in the same direction.", "Medium", ARTICLES.twoPointers, [
        ["Valid Palindrome", "Easy", "valid-palindrome"],
        ["3Sum", "Medium", "3sum"],
        ["Container With Most Water", "Medium", "container-with-most-water"],
        ["Trapping Rain Water", "Hard", "trapping-rain-water"],
      ]),
      topic("Sliding Window", "Fixed and variable size windows over arrays and strings.", "Medium", ARTICLES.slidingWindow, [
        ["Longest Substring Without Repeating Characters", "Medium", "longest-substring-without-repeating-characters"],
        ["Longest Repeating Character Replacement", "Medium", "longest-repeating-character-replacement"],
        ["Minimum Window Substring", "Hard", "minimum-window-substring"],
        ["Sliding Window Maximum", "Hard", "sliding-window-maximum"],
      ]),
    ],
  },
  {
    title: "Binary Search",
    description: "Search sorted spaces - including the space of possible answers.",
    topics: [
      topic("Binary Search Basics", "Classic search and rotated sorted arrays.", "Medium", ARTICLES.binarySearch, [
        ["Binary Search", "Easy", "binary-search"],
        ["Search in Rotated Sorted Array", "Medium", "search-in-rotated-sorted-array"],
        ["Find Minimum in Rotated Sorted Array", "Medium", "find-minimum-in-rotated-sorted-array"],
        ["Median of Two Sorted Arrays", "Hard", "median-of-two-sorted-arrays"],
      ]),
      topic("Binary Search on Answer", "Binary search over a monotonic predicate.", "Hard", ARTICLES.binarySearch, [
        ["Koko Eating Bananas", "Medium", "koko-eating-bananas"],
        ["Capacity To Ship Packages Within D Days", "Medium", "capacity-to-ship-packages-within-d-days"],
        ["Split Array Largest Sum", "Hard", "split-array-largest-sum"],
      ]),
    ],
  },
  {
    title: "Linked List & Stack",
    description: "Pointer manipulation and LIFO patterns.",
    topics: [
      topic("Linked List", "Reversal, fast/slow pointers and merging.", "Medium", ARTICLES.linkedList, [
        ["Reverse Linked List", "Easy", "reverse-linked-list"],
        ["Merge Two Sorted Lists", "Easy", "merge-two-sorted-lists"],
        ["Linked List Cycle", "Easy", "linked-list-cycle"],
        ["Reorder List", "Medium", "reorder-list"],
        ["Merge k Sorted Lists", "Hard", "merge-k-sorted-lists"],
      ]),
      topic("Stack & Monotonic Stack", "Matching brackets and next-greater-element patterns.", "Medium", ARTICLES.stack, [
        ["Valid Parentheses", "Easy", "valid-parentheses"],
        ["Min Stack", "Medium", "min-stack"],
        ["Daily Temperatures", "Medium", "daily-temperatures"],
        ["Largest Rectangle in Histogram", "Hard", "largest-rectangle-in-histogram"],
      ]),
    ],
  },
  {
    title: "Trees & Graphs",
    description: "Recursion, BFS/DFS and topological ordering.",
    topics: [
      topic("Binary Trees", "DFS/BFS traversals and BST properties.", "Medium", ARTICLES.binaryTree, [
        ["Maximum Depth of Binary Tree", "Easy", "maximum-depth-of-binary-tree"],
        ["Invert Binary Tree", "Easy", "invert-binary-tree"],
        ["Binary Tree Level Order Traversal", "Medium", "binary-tree-level-order-traversal"],
        ["Validate Binary Search Tree", "Medium", "validate-binary-search-tree"],
        ["Binary Tree Maximum Path Sum", "Hard", "binary-tree-maximum-path-sum"],
      ]),
      topic("Graphs", "Grid traversal, cloning, cycle detection and shortest paths.", "Hard", ARTICLES.graph, [
        ["Number of Islands", "Medium", "number-of-islands"],
        ["Clone Graph", "Medium", "clone-graph"],
        ["Course Schedule", "Medium", "course-schedule"],
        ["Rotting Oranges", "Medium", "rotting-oranges"],
        ["Word Ladder", "Hard", "word-ladder"],
      ]),
    ],
  },
  {
    title: "Dynamic Programming",
    description: "Break problems into overlapping sub-problems.",
    topics: [
      topic("1D Dynamic Programming", "Linear recurrences and choices at each step.", "Medium", ARTICLES.dp, [
        ["Climbing Stairs", "Easy", "climbing-stairs"],
        ["House Robber", "Medium", "house-robber"],
        ["Coin Change", "Medium", "coin-change"],
        ["Longest Increasing Subsequence", "Medium", "longest-increasing-subsequence"],
      ]),
      topic("2D Dynamic Programming", "Grids, strings and interval DP.", "Hard", ARTICLES.lcs, [
        ["Unique Paths", "Medium", "unique-paths"],
        ["Longest Common Subsequence", "Medium", "longest-common-subsequence"],
        ["Edit Distance", "Medium", "edit-distance"],
        ["Burst Balloons", "Hard", "burst-balloons"],
      ]),
    ],
  },
];
