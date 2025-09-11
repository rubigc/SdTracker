package downloadreplay

import (
	"context"
	"log"
	"os"
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

	// Make sure downloads dir exists
	if err := os.MkdirAll("./downloads", 0755); err != nil {
		log.Fatalf("Failed to create downloads folder: %v", err)
	}

	// Create Chrome allocator with modern headless mode and persistent profile
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true), // ✅ modern headless mode
		chromedp.Flag("no-sandbox", true),
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
			if e.State == browser.DownloadProgressStateCanceled {
				log.Printf("[ERROR] Download canceled by Chrome")
				done <- ""
				close(done)
			}
		}
	})

	// Step 1: Navigate
	log.Printf("[INFO] Navigating to page...")
	if err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Printf("[ERROR] Failed navigation: %v", err)
		return ""
	}

	// Step 2: Cookie consent (only click if present)
	log.Printf("[INFO] Checking cookie consent...")
	var cookieExists bool
	if err := chromedp.Run(ctx,
		chromedp.Evaluate(`document.querySelector(".fc-button.fc-cta-consent.fc-primary-button") !== null`, &cookieExists),
	); err != nil {
		log.Printf("[WARN] Cookie check failed: %v", err)
	}
	if cookieExists {
		log.Printf("[INFO] Cookie popup found, clicking accept...")
		if err := chromedp.Run(ctx,
			chromedp.Click(".fc-button.fc-cta-consent.fc-primary-button", chromedp.NodeVisible, chromedp.ByQuery),
		); err != nil {
			log.Printf("[WARN] Failed to click cookie consent: %v", err)
		}
	} else {
		log.Printf("[INFO] No cookie popup detected")
	}

	// Step 3: Login flow
	log.Printf("[INFO] Logging in...")
	if err := chromedp.Run(ctx,
		chromedp.Click(`#header > div.userbar > button:nth-child(1)`, chromedp.NodeVisible),
		chromedp.WaitVisible(`input[name="username"]`),
		chromedp.SendKeys(`input[name="username"]`, username+"\r"),
		chromedp.Sleep(1*time.Second),
		chromedp.WaitVisible(`input[name="password"]`),
		chromedp.SendKeys(`input[name="password"]`, password+"\r"),
		chromedp.Sleep(3*time.Second),
	); err != nil {
		log.Printf("[ERROR] Login failed: %v", err)
		return ""
	}

	// Step 4: Click download button
	log.Printf("[INFO] Clicking download button...")
	if err := chromedp.Run(ctx,
		browser.SetDownloadBehavior(browser.SetDownloadBehaviorBehaviorAllow).
			WithDownloadPath("./downloads").
			WithEventsEnabled(true),
		chromedp.Click(".replayDownloadButton", chromedp.NodeVisible),
	); err != nil && !strings.Contains(err.Error(), "net::ERR_ABORTED") {
		log.Printf("[ERROR] Failed to click download button: %v", err)
		return ""
	}

	// Step 6: Wait for download
	log.Printf("[INFO] Waiting for download to complete...")
	filename := <-done
	if filename == "" {
		log.Printf("[ERROR] No file downloaded")
		return ""
	}

	filePath := filepath.Join("./downloads", filename)
	log.Printf("[INFO] Replay downloaded to: %s", filePath)
	return filePath

}
