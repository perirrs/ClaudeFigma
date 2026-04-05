package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"sync/atomic"
	"time"

	"github.com/getlantern/systray"
)

var (
	paused atomic.Bool
	agg    *Aggregator
	up     *Uploader
	cfg    Config
	cfgPath string
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)

	var err error
	cfg, cfgPath, err = loadConfig()
	if err != nil {
		log.Printf("config load: %v", err)
	}
	log.Printf("config: %s", cfgPath)

	host, _ := os.Hostname()
	agg = NewAggregator(host, cfg.IdleSec, cfg.PollSec)
	up = NewUploader(cfg)

	go pollLoop()
	go flushLoop()

	systray.Run(onReady, onExit)
}

func onReady() {
	systray.SetTitle("PA")
	systray.SetTooltip("Productivity Analyser – desktop agent")
	systray.SetIcon(iconBytes())

	mStatus := systray.AddMenuItem("Status: starting…", "")
	mStatus.Disable()
	systray.AddSeparator()
	mDashboard := systray.AddMenuItem("Open dashboard", "Open cloud dashboard")
	mSettings := systray.AddMenuItem("Open settings file", "Edit config.json")
	mPause := systray.AddMenuItemCheckbox("Pause tracking", "Stop recording until resumed", false)
	systray.AddSeparator()
	mFlush := systray.AddMenuItem("Flush now", "Send pending buckets immediately")
	mQuit := systray.AddMenuItem("Quit", "Exit the agent")

	// Background menu click handlers.
	go func() {
		for {
			select {
			case <-mDashboard.ClickedCh:
				openURL(cfg.CloudURL + "/dashboard")
			case <-mSettings.ClickedCh:
				openURL(cfgPath)
			case <-mPause.ClickedCh:
				if mPause.Checked() {
					mPause.Uncheck()
					paused.Store(false)
				} else {
					mPause.Check()
					paused.Store(true)
					// Flush the in-progress minute so it's not lost.
					up.Send(agg.DrainAll())
				}
			case <-mFlush.ClickedCh:
				up.Send(agg.DrainAll())
			case <-mQuit.ClickedCh:
				systray.Quit()
				return
			}
		}
	}()

	// Status ticker.
	go func() {
		t := time.NewTicker(3 * time.Second)
		defer t.Stop()
		for range t.C {
			status, errMsg, backlog := up.Status()
			label := "Status: "
			if paused.Load() {
				label += "paused"
			} else if status == "" {
				label += "warming up"
			} else if status == "ok" {
				label += fmt.Sprintf("connected · sent %s", up.LastSent.Format("15:04:05"))
			} else {
				label += "error: " + truncate(errMsg, 40)
			}
			if backlog > 0 {
				label += fmt.Sprintf(" · backlog %d", backlog)
			}
			mStatus.SetTitle(label)
		}
	}()
}

func onExit() {
	// Final flush.
	up.Send(agg.DrainAll())
}

func pollLoop() {
	t := time.NewTicker(time.Duration(cfg.PollSec) * time.Second)
	defer t.Stop()
	for now := range t.C {
		if paused.Load() {
			continue
		}
		s := Snapshot()
		agg.Record(s, now)
	}
}

func flushLoop() {
	t := time.NewTicker(time.Duration(cfg.FlushSec) * time.Second)
	defer t.Stop()
	for now := range t.C {
		buckets := agg.Drain(now)
		if len(buckets) > 0 {
			up.Send(buckets)
		}
	}
}

func openURL(target string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", target)
	case "darwin":
		cmd = exec.Command("open", target)
	default:
		cmd = exec.Command("xdg-open", target)
	}
	if err := cmd.Start(); err != nil {
		log.Printf("openURL: %v", err)
	}
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}
