package downloadreplay

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/chromedp/cdproto/browser"
	"github.com/chromedp/chromedp"
)

func Download(url string) string {
	// create context
	ctx, cancel := chromedp.NewContext(
		context.Background(),
		chromedp.WithDebugf(log.Printf),
	)
	defer cancel()

	// create a timeout as a safety net to prevent any infinite wait loops
	ctx, cancel = context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	// set up a channel, so we can block later while we monitor the download
	// progress
	done := make(chan string, 1)
	// set up a listener to watch the download events and close the channel
	// when complete this could be expanded to handle multiple downloads
	// through creating a guid map, monitor download urls via
	// EventDownloadWillBegin, etc
	chromedp.ListenTarget(ctx, func(v interface{}) {
		if ev, ok := v.(*browser.EventDownloadProgress); ok {
			completed := "(unknown)"
			if ev.TotalBytes != 0 {
				completed = fmt.Sprintf("%0.2f%%", ev.ReceivedBytes/ev.TotalBytes*100.0)
			}
			log.Printf("state: %s, completed: %s\n", ev.State.String(), completed)
			if ev.State == browser.DownloadProgressStateCompleted {
				done <- ev.GUID
				close(done)
			}
		}
	})

	if err := chromedp.Run(ctx,
		// navigate to the page
		chromedp.Navigate(url),
		// find and click "Code" button when ready
		chromedp.Click(".fc-button.fc-cta-consent.fc-primary-button", chromedp.ByQuery),
		browser.
			SetDownloadBehavior(browser.SetDownloadBehaviorBehaviorAllowAndName).
			WithDownloadPath("./downloads").
			WithEventsEnabled(true),
		// click the "Download Replay" link when visible
		chromedp.Click(`.replayDownloadButton`, chromedp.ByQuery, chromedp.NodeVisible),
	); err != nil && !strings.Contains(err.Error(), "net::ERR_ABORTED") {
		// Note: Ignoring the net::ERR_ABORTED page error is essential here
		// since downloads will cause this error to be emitted, although the
		// download will still succeed.
		log.Fatal(err)
	}

	// This will block until the chromedp listener closes the channel
	guid := <-done

	// We can predict the exact file location and name here because of how we
	// configured SetDownloadBehavior and WithDownloadPath
	log.Printf("wrote %s", filepath.Join("./downloads", guid))

	return "test"
}
