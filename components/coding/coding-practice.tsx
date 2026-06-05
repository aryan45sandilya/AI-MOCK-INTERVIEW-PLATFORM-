"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wand2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "@/components/coding/code-editor";
import { cn, getDifficultyColor } from "@/lib/utils";

interface CodingProblem {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  codeTemplate: string;
  language: string;
}

const SAMPLE_PROBLEMS: CodingProblem[] = [
  {
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays & Hashing",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists"],
    codeTemplate: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
};

// Test
console.log(twoSum([2,7,11,15], 9)); // [0,1]
console.log(twoSum([3,2,4], 6));     // [1,2]`,
    language: "javascript",
  },
  {
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stack",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    codeTemplate: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your solution here
};

console.log(isValid("()"));     // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false`,
    language: "javascript",
  },
  {
    title: "Binary Search",
    difficulty: "easy",
    category: "Binary Search",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums at index 4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique"],
    codeTemplate: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your solution here
};

console.log(search([-1,0,3,5,9,12], 9));  // 4
console.log(search([-1,0,3,5,9,12], 2)); // -1`,
    language: "javascript",
  },
  {
    title: "Maximum Subarray",
    difficulty: "medium",
    category: "Dynamic Programming",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6" },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    codeTemplate: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your solution here
};

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6
console.log(maxSubArray([5,4,-1,7,8]));             // 23`,
    language: "javascript",
  },
  {
    title: "LRU Cache",
    difficulty: "hard",
    category: "Design",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size `capacity`.\n- `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.\n- `void put(int key, int value)` Update the value of the `key` if it exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the `capacity`, evict the least recently used key.",
    examples: [
      {
        input: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1);\nlRUCache.put(2, 2);\nlRUCache.get(1);\nlRUCache.put(3, 3);\nlRUCache.get(2);',
        output: "[null,null,null,1,null,-1]"
      },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5"],
    codeTemplate: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    // Your solution here
  }

  put(key, value) {
    // Your solution here
  }
}

const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 1
cache.put(3, 3);
console.log(cache.get(2)); // -1`,
    language: "javascript",
  },
];

const CATEGORIES = ["All", "Arrays & Hashing", "Stack", "Binary Search", "Dynamic Programming", "Design"];

export function CodingPractice() {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(SAMPLE_PROBLEMS[0]);
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("All");
  const [showDescription, setShowDescription] = useState(true);

  const filtered = SAMPLE_PROBLEMS.filter((p) => {
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (category !== "All" && p.category !== category) return false;
    return true;
  });

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Problem List */}
      <div className="lg:col-span-2 space-y-3">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Problem List */}
        <div className="space-y-2">
          {filtered.map((problem) => (
            <button
              key={problem.title}
              onClick={() => setSelectedProblem(problem)}
              className={cn(
                "w-full text-left rounded-lg border p-3 transition-all hover:border-primary/50",
                selectedProblem.title === problem.title
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">{problem.title}</p>
                <Badge
                  className={cn("text-xs shrink-0", getDifficultyColor(problem.difficulty))}
                  variant="outline"
                >
                  {problem.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{problem.category}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No problems match filters</p>
          )}
        </div>
      </div>

      {/* Problem Detail + Editor */}
      <div className="lg:col-span-3 space-y-4">
        {/* Problem Description */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{selectedProblem.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    className={cn("text-xs", getDifficultyColor(selectedProblem.difficulty))}
                    variant="outline"
                  >
                    {selectedProblem.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{selectedProblem.category}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDescription(!showDescription)}
                className="gap-1 shrink-0"
              >
                {showDescription ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showDescription ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>

          {showDescription && (
            <CardContent className="space-y-4 pt-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-line">{selectedProblem.description}</p>
              </div>

              {selectedProblem.examples.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Examples:</p>
                  {selectedProblem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg bg-muted/60 p-3 mb-2 text-xs font-mono space-y-1">
                      <div><span className="text-muted-foreground">Input: </span>{ex.input}</div>
                      <div><span className="text-muted-foreground">Output: </span>{ex.output}</div>
                      {ex.explanation && (
                        <div><span className="text-muted-foreground">Explanation: </span>{ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedProblem.constraints.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Constraints:</p>
                  <ul className="space-y-1">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        <code className="font-mono">{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Code Editor */}
        <CodeEditor
          language={selectedProblem.language}
          defaultValue={selectedProblem.codeTemplate}
          height="380px"
        />
      </div>
    </div>
  );
}
