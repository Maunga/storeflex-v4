<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{
    /**
     * Get all bookmarks for the authenticated user.
     */
    public function index()
    {
        $bookmarks = Auth::user()
            ->bookmarks()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'img_url', 'title', 'price', 'asin']);

        return response()->json($bookmarks);
    }

    /**
     * Add a new bookmark.
     */
    public function store(Request $request)
    {
        $request->validate([
            'img_url' => 'required|string|max:2000',
            'title' => 'required|string|max:500',
            'price' => 'required|numeric|min:0',
            'asin' => 'nullable|string|max:20',
        ]);

        // Check if already bookmarked (by ASIN if available, otherwise by title)
        $query = Auth::user()->bookmarks();
        if ($request->asin) {
            $query->where('asin', $request->asin);
        } else {
            $query->where('title', $request->title);
        }

        if ($query->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Already bookmarked',
            ], 409);
        }

        $bookmark = Auth::user()->bookmarks()->create([
            'img_url' => $request->img_url,
            'title' => $request->title,
            'price' => $request->price,
            'asin' => $request->asin,
        ]);

        return response()->json([
            'success' => true,
            'bookmark' => $bookmark,
        ], 201);
    }

    /**
     * Remove a bookmark.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'asin' => 'nullable|string|max:20',
            'id' => 'nullable|integer',
        ]);

        $query = Auth::user()->bookmarks();

        if ($request->id) {
            $query->where('id', $request->id);
        } elseif ($request->asin) {
            $query->where('asin', $request->asin);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Must provide id or asin',
            ], 400);
        }

        $deleted = $query->delete();

        return response()->json([
            'success' => $deleted > 0,
            'deleted' => $deleted,
        ]);
    }

    /**
     * Check if a product is bookmarked.
     */
    public function check(Request $request)
    {
        $request->validate([
            'asin' => 'required|string|max:20',
        ]);

        $bookmarked = Auth::user()
            ->bookmarks()
            ->where('asin', $request->asin)
            ->exists();

        return response()->json([
            'bookmarked' => $bookmarked,
        ]);
    }
}
