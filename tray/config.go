package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

// Config is persisted to %APPDATA%\ProductivityAnalyser\config.json. The
// recruiter fills this in once (same API key as the Chrome extension).
type Config struct {
	CloudURL string `json:"cloud_url"`
	APIKey   string `json:"api_key"`
	PollSec  int    `json:"poll_sec"`  // foreground sample interval (default 5)
	FlushSec int    `json:"flush_sec"` // POST interval (default 60)
	IdleSec  int    `json:"idle_sec"`  // treat >N seconds no-input as idle (default 120)
}

func defaultConfig() Config {
	return Config{
		CloudURL: "http://localhost:3000",
		APIKey:   "",
		PollSec:  5,
		FlushSec: 60,
		IdleSec:  120,
	}
}

func configPath() (string, error) {
	appdata := os.Getenv("APPDATA")
	if appdata == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		appdata = filepath.Join(home, ".config")
	}
	dir := filepath.Join(appdata, "ProductivityAnalyser")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "config.json"), nil
}

func loadConfig() (Config, string, error) {
	cfg := defaultConfig()
	p, err := configPath()
	if err != nil {
		return cfg, "", err
	}
	b, err := os.ReadFile(p)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			_ = saveConfig(cfg)
			return cfg, p, nil
		}
		return cfg, p, err
	}
	_ = json.Unmarshal(b, &cfg)
	if cfg.PollSec <= 0 {
		cfg.PollSec = 5
	}
	if cfg.FlushSec <= 0 {
		cfg.FlushSec = 60
	}
	if cfg.IdleSec <= 0 {
		cfg.IdleSec = 120
	}
	return cfg, p, nil
}

func saveConfig(cfg Config) error {
	p, err := configPath()
	if err != nil {
		return err
	}
	b, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, b, 0o644)
}
