package downloadreplay

import (
	"context"
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/chromedp/cdproto/browser"
	"github.com/chromedp/chromedp"
)

func Download(url string) string {
	username := "Sdtracker"
	password := "KindaPublicPassword123"
	// create context
	ctx, cancel := chromedp.NewContext(context.Background(), chromedp.WithDebugf(log.Printf))
	defer cancel()

	// set timeout
	ctx, cancel = context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	// channel for download completion
	done := make(chan string, 1)
	var downloadedFilename string

	// listen for download events
	chromedp.ListenTarget(ctx, func(v interface{}) {
		switch ev := v.(type) {
		case *browser.EventDownloadWillBegin:
			log.Printf("Download started: %s\n", ev.URL)
			downloadedFilename = ev.SuggestedFilename // real filename from browser

		case *browser.EventDownloadProgress:
			if ev.State == browser.DownloadProgressStateCompleted {
				done <- downloadedFilename
				close(done)
			}
		}
	})

	// Run chromedp tasks
	if err := chromedp.Run(ctx,
		// Navigate to URL
		chromedp.Navigate(url),

		// Handle cookie consent (optional)
		chromedp.Sleep(2*time.Second),
		chromedp.ActionFunc(func(ctx context.Context) error {
			return chromedp.Click(".fc-button.fc-cta-consent.fc-primary-button", chromedp.NodeVisible).Do(ctx)
		}),

		// Click login button
		chromedp.Click(`#header > div.userbar > button:nth-child(1)`, chromedp.NodeVisible),

		// Enter username and submit
		chromedp.WaitVisible(`input[name="username"]`),
		chromedp.SendKeys(`input[name="username"]`, username),
		chromedp.KeyEvent("\r"), // Press Enter
		chromedp.Sleep(1*time.Second),

		// Enter password and submit
		chromedp.WaitVisible(`input[name="password"]`),
		chromedp.SendKeys(`input[name="password"]`, password),
		chromedp.KeyEvent("\r"),
		chromedp.Sleep(3*time.Second), // wait for login to complete

		// Set up download behavior
		browser.SetDownloadBehavior(browser.SetDownloadBehaviorBehaviorAllowAndName).
			WithDownloadPath("./downloads").
			WithEventsEnabled(true),

		// Click download button
		chromedp.Click(".replayDownloadButton", chromedp.NodeVisible),
	); err != nil && !strings.Contains(err.Error(), "net::ERR_ABORTED") {
		return ""
	}

	// Wait for download to finish
	filename := <-done
	filePath := filepath.Join("./downloads", filename)
	log.Printf("Downloaded to %s", filePath)
	return filePath
}
