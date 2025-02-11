package replaydownload

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/chromedp/chromedp"
)

func replaydownload(url string) int {
	//Basically all the stuff it goes to the link of a battle and downloads the replay if the battle has finished...  "button replayDownloadButton"

	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()
	

}