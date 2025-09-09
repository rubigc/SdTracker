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

// Download downloads a replay from a given URL and returns the local file path.
func Download(url string) string {
	username := "Sdtracker"
	password := "KindaPublicPassword123"

	log.Printf("[INFO] Starting download for URL: %s", url)

	// Create Chrome allocator with headless mode
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Headless,
	)
	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx, chromedp.WithLogf(log.Printf))
	defer cancel()

	// Set timeout
	ctx, cancel = context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	done := make(chan string, 1)
	var downloadedFilename string

	// Listen for download events
	chromedp.ListenTarget(ctx, func(ev interface{}) {
		switch e := ev.(type) {
		case *browser.EventDownloadWillBegin:
			log.Printf("[INFO] Download started: %s", e.URL)
			downloadedFilename = e.SuggestedFilename
		case *browser.EventDownloadProgress:
			log.Printf("[DEBUG] Download progress: %v, State: %s", e.ReceivedBytes, e.State)
			if e.State == browser.DownloadProgressStateCompleted {
				log.Printf("[INFO] Download completed: %s", downloadedFilename)
				done <- downloadedFilename
				close(done)
			}
		}
	})

	// Run chromedp tasks
	log.Printf("[INFO] Navigating to page...")
	err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.Sleep(2*time.Second),

		// Click cookie consent if present
		chromedp.ActionFunc(func(ctx context.Context) error {
			log.Printf("[INFO] Trying to accept cookie consent...")
			err := chromedp.Click(".fc-button.fc-cta-consent.fc-primary-button", chromedp.NodeVisible).Do(ctx)
			if err != nil {
				log.Printf("[WARN] Cookie consent not found or already accepted: %v", err)
			} else {
				log.Printf("[INFO] Cookie consent accepted")
			}
			return nil
		}),

		// Click login button
		chromedp.ActionFunc(func(ctx context.Context) error {
			return chromedp.Click(`#header > div.userbar > button:nth-child(1)`, chromedp.NodeVisible).Do(ctx)
		}),

		chromedp.WaitVisible(`input[name="username"]`),
		chromedp.SendKeys(`input[name="username"]`, username),
		chromedp.KeyEvent("\r"),
		chromedp.Sleep(1*time.Second),

		// Enter password
		chromedp.WaitVisible(`input[name="password"]`),
		chromedp.SendKeys(`input[name="password"]`, password),
		chromedp.KeyEvent("\r"),
		chromedp.Sleep(3*time.Second),

		// Set up download behavior
		browser.SetDownloadBehavior(browser.SetDownloadBehaviorBehaviorAllowAndName).
			WithDownloadPath("./downloads").
			WithEventsEnabled(true),

		// Click download button
		chromedp.ActionFunc(func(ctx context.Context) error {
			log.Printf("[INFO] Clicking download button...")
			err := chromedp.Click(".replayDownloadButton", chromedp.NodeVisible).Do(ctx)
			if err != nil {
				log.Printf("[ERROR] Failed to click download button: %v", err)
				return err
			}
			log.Printf("[INFO] Download button clicked successfully")
			return nil
		}),
	)

	if err != nil && !strings.Contains(err.Error(), "net::ERR_ABORTED") {
		log.Printf("[ERROR] chromedp.Run failed: %v", err)
		return ""
	}

	// Wait for download to finish
	log.Printf("[INFO] Waiting for download to complete...")
	filename := <-done
	filePath := filepath.Join("./downloads", filename)
	log.Printf("[INFO] Replay downloaded to: %s", filePath)
	return filePath
}
