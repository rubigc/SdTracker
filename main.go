package main

import (
	backend "SdTracker/backend"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := backend.NewApp() // Your backend instance

	err := wails.Run(&options.App{
		Title:  "SdTracker",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets, // Required
		},
		Bind: []interface{}{
			app, // Required for frontend access
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
