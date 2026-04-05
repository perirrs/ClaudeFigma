//go:build windows

package main

import (
	"path/filepath"
	"strings"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

// Thin wrapper around Win32 APIs we need. Everything here is syscall-only so
// the binary stays CGO-free and cross-compilable from Linux.

var (
	user32                        = windows.NewLazySystemDLL("user32.dll")
	kernel32                      = windows.NewLazySystemDLL("kernel32.dll")
	psapi                         = windows.NewLazySystemDLL("psapi.dll")
	procGetForegroundWindow       = user32.NewProc("GetForegroundWindow")
	procGetWindowTextW            = user32.NewProc("GetWindowTextW")
	procGetWindowThreadProcessId  = user32.NewProc("GetWindowThreadProcessId")
	procGetLastInputInfo          = user32.NewProc("GetLastInputInfo")
	procGetTickCount              = kernel32.NewProc("GetTickCount")
	procGetModuleFileNameExW      = psapi.NewProc("GetModuleFileNameExW")
	procQueryFullProcessImageName = kernel32.NewProc("QueryFullProcessImageNameW")
)

type lastInputInfo struct {
	cbSize uint32
	dwTime uint32
}

// Sample describes the foreground window at a point in time.
type Sample struct {
	App    string // executable basename lowercased, e.g. "chrome"
	Title  string // window title
	IdleMs uint32 // how long since last keyboard/mouse input
}

// Snapshot grabs one foreground sample + idle time.
func Snapshot() Sample {
	s := Sample{}

	hwnd, _, _ := procGetForegroundWindow.Call()
	if hwnd != 0 {
		buf := make([]uint16, 512)
		n, _, _ := procGetWindowTextW.Call(hwnd, uintptr(unsafe.Pointer(&buf[0])), 512)
		if n > 0 {
			s.Title = syscall.UTF16ToString(buf[:n])
		}
		var pid uint32
		procGetWindowThreadProcessId.Call(hwnd, uintptr(unsafe.Pointer(&pid)))
		if pid != 0 {
			s.App = processName(pid)
		}
	}

	var info lastInputInfo
	info.cbSize = uint32(unsafe.Sizeof(info))
	ret, _, _ := procGetLastInputInfo.Call(uintptr(unsafe.Pointer(&info)))
	if ret != 0 {
		tick, _, _ := procGetTickCount.Call()
		s.IdleMs = uint32(tick) - info.dwTime
	}
	return s
}

func processName(pid uint32) string {
	const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
	h, err := windows.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)
	if err != nil || h == 0 {
		return ""
	}
	defer windows.CloseHandle(h)

	buf := make([]uint16, windows.MAX_PATH)
	size := uint32(len(buf))
	r1, _, _ := procQueryFullProcessImageName.Call(uintptr(h), 0, uintptr(unsafe.Pointer(&buf[0])), uintptr(unsafe.Pointer(&size)))
	if r1 == 0 {
		// Fallback to GetModuleFileNameExW.
		n, _, _ := procGetModuleFileNameExW.Call(uintptr(h), 0, uintptr(unsafe.Pointer(&buf[0])), uintptr(len(buf)))
		if n == 0 {
			return ""
		}
		size = uint32(n)
	}
	full := syscall.UTF16ToString(buf[:size])
	base := filepath.Base(full)
	return strings.ToLower(strings.TrimSuffix(base, filepath.Ext(base)))
}
