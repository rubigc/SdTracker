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
	downloadDir, _ := filepath.Abs("./downloads")
	if err := os.MkdirAll(downloadDir, 0755); err != nil {
		log.Fatalf("Failed to create downloads folder: %v", err)
	}

	// Create Chrome allocator with modern headless mode and persistent profile
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true), // ✅ modern headless
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
	var downloadGUID string

	// Listen for download events
	chromedp.ListenTarget(ctx, func(ev interface{}) {
		switch e := ev.(type) {
		case *browser.EventDownloadWillBegin:
			log.Printf("[INFO] Download started: %s", e.URL)
			downloadedFilename = e.SuggestedFilename
			downloadGUID = e.GUID
		case *browser.EventDownloadProgress:
			log.Printf("[DEBUG] Download progress: %v, State: %s", e.ReceivedBytes, e.State)
			if e.State == browser.DownloadProgressStateCompleted {
				log.Printf("[INFO] Download completed: %s", downloadedFilename)

				actualPath := filepath.Join(downloadDir, downloadGUID)
				finalPath := filepath.Join(downloadDir, downloadedFilename)

				// Wait for Chrome to release the file
				for i := 0; i < 10; i++ {
					if _, err := os.Stat(actualPath); err == nil {
						break
					}
					time.Sleep(500 * time.Millisecond)
				}

				// Rename GUID file -> correct filename
				if err := os.Rename(actualPath, finalPath); err != nil {
					log.Printf("[WARN] Failed renaming %s -> %s: %v", actualPath, finalPath, err)
					done <- actualPath
				} else {
					done <- finalPath
				}
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

	// Step 2: Cookie consent
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
	}

	log.Println("[INFO] Clicking login button")
	if err := chromedp.Run(ctx,
		chromedp.Click(`#header > div.userbar > button:nth-child(1)`, chromedp.NodeVisible),
	); err != nil {
		log.Printf("[ERROR] Click failed: %v", err)
		return ""
	}

	log.Println("[INFO] Typing username")
	if err := chromedp.Run(ctx,
		chromedp.SendKeys(`input[name="username"]`, username+"\n"),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Printf("[ERROR] Typing username failed: %v", err)
		return ""
	}

	log.Println("[INFO] Typing password")
	if err := chromedp.Run(ctx,
		chromedp.SendKeys(`input[name="password"]`, password+"\n"),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Printf("[ERROR] Typing password failed: %v", err)
		return ""
	}

	log.Println("[INFO] Waiting for post-login element")
	if err := chromedp.Run(ctx,
		// Wait for an element you expect after login
		chromedp.WaitVisible(`#header > div.userbar > span > span`),
	); err != nil {
		log.Printf("[ERROR] Post-login element not found: %v", err)
		return ""
	}

	log.Println("[INFO] Login flow completed successfully")

	// Step 4: Click download button
	log.Printf("[INFO] Clicking download button...")
	if err := chromedp.Run(ctx,
		browser.SetDownloadBehavior(browser.SetDownloadBehaviorBehaviorAllowAndName).
			WithDownloadPath(downloadDir).
			WithEventsEnabled(true),
		chromedp.Click(".replayDownloadButton", chromedp.NodeVisible),
	); err != nil && !strings.Contains(err.Error(), "net::ERR_ABORTED") {
		log.Printf("[ERROR] Failed to click download button: %v", err)
		return ""
	}

	// Step 5: Wait for download
	log.Printf("[INFO] Waiting for download to complete...")
	filePath := <-done
	if filePath == "" {
		log.Printf("[ERROR] No file downloaded")
		return ""
	}

	absPath, _ := filepath.Abs(filePath)
	log.Printf("[INFO] Replay downloaded to: %s", absPath)
	return absPath
}

func CheckIfBattleFinished(url string) bool {
	username := "Sdtracker"
	password := "KindaPublicPassword123"

	// Create Chrome allocator with modern headless mode and persistent profile
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true), // ✅ modern headless
		chromedp.Flag("no-sandbox", true),
	)
	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx, chromedp.WithLogf(log.Printf))
	defer cancel()

	// Set timeout
	ctx, cancel = context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	// Step 1: Navigate
	log.Printf("[INFO] Navigating to page...")
	if err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Printf("[ERROR] Failed navigation: %v", err)
		return false
	}

	// Step 2: Cookie consent
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
	}

	log.Println("[INFO] Clicking login button")
	if err := chromedp.Run(ctx,
		chromedp.Click(`#header > div.userbar > button:nth-child(1)`, chromedp.NodeVisible),
	); err != nil {
		log.Printf("[ERROR] Click failed: %v", err)
		return false
	}

	log.Println("[INFO] Typing username")
	if err := chromedp.Run(ctx,
		chromedp.SendKeys(`input[name="username"]`, username+"\n"),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Printf("[ERROR] Typing username failed: %v", err)
		return false
	}

	log.Println("[INFO] Typing password")
	if err := chromedp.Run(ctx,
		chromedp.SendKeys(`input[name="password"]`, password+"\n"),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Printf("[ERROR] Typing password failed: %v", err)
		return false
	}

	log.Println("[INFO] Waiting for post-login element")
	if err := chromedp.Run(ctx,
		// Wait for an element you expect after login
		chromedp.WaitVisible(`#header > div.userbar > span > span`),
	); err != nil {
		log.Printf("[ERROR] Post-login element not found: %v", err)
		return false
	}

	log.Printf("[INFO] Checking for download Button")
	var downloadButtonExists bool
	if err := chromedp.Run(ctx,
		chromedp.Evaluate(`document.querySelector(".replayDownloadButton") !== null`, &downloadButtonExists),
	); err != nil {
		log.Printf("[WARN] Downloadable check failed: %v", err)
	}
	if downloadButtonExists {
		return true
	} else {
		return false
	}
}
