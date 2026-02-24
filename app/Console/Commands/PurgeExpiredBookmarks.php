<?php

namespace App\Console\Commands;

use App\Models\Bookmark;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PurgeExpiredBookmarks extends Command
{
    protected $signature = 'bookmarks:purge-expired';

    protected $description = 'Delete all bookmarks older than 7 days';

    public function handle(): int
    {
        $cutoff = Carbon::now()->subDays(7);

        $count = Bookmark::where('created_at', '<', $cutoff)->delete();

        $this->info("Deleted {$count} expired bookmark(s).");

        return self::SUCCESS;
    }
}
