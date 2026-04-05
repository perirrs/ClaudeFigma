package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Uploader POSTs batches of Buckets to /api/ingest/desktop. Failed batches are
// kept in memory and retried next flush (capped to avoid unbounded growth).
type Uploader struct {
	cfg    Config
	client *http.Client

	mu      sync.Mutex
	backlog []Bucket

	LastErr    string
	LastStatus string
	LastSent   time.Time
}

const maxBacklog = 5000

func NewUploader(cfg Config) *Uploader {
	return &Uploader{
		cfg:    cfg,
		client: &http.Client{Timeout: 15 * time.Second},
	}
}

func (u *Uploader) Send(buckets []Bucket) {
	if len(buckets) == 0 {
		return
	}
	u.mu.Lock()
	u.backlog = append(u.backlog, buckets...)
	if len(u.backlog) > maxBacklog {
		u.backlog = u.backlog[len(u.backlog)-maxBacklog:]
	}
	pending := make([]Bucket, len(u.backlog))
	copy(pending, u.backlog)
	u.mu.Unlock()

	if err := u.post(pending); err != nil {
		u.mu.Lock()
		u.LastErr = err.Error()
		u.LastStatus = "error"
		u.mu.Unlock()
		return
	}

	u.mu.Lock()
	u.backlog = u.backlog[:0]
	u.LastErr = ""
	u.LastStatus = "ok"
	u.LastSent = time.Now()
	u.mu.Unlock()
}

func (u *Uploader) post(buckets []Bucket) error {
	if u.cfg.APIKey == "" {
		return fmt.Errorf("no API key configured")
	}
	body, err := json.Marshal(buckets)
	if err != nil {
		return err
	}
	url := strings.TrimRight(u.cfg.CloudURL, "/") + "/api/ingest/desktop"
	req, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-PA-Key", u.cfg.APIKey)
	resp, err := u.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return fmt.Errorf("http %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}
	io.Copy(io.Discard, resp.Body)
	return nil
}

func (u *Uploader) Status() (string, string, int) {
	u.mu.Lock()
	defer u.mu.Unlock()
	return u.LastStatus, u.LastErr, len(u.backlog)
}
