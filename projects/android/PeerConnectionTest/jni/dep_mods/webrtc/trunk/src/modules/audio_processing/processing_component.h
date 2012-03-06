/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

#ifndef WEBRTC_MODULES_AUDIO_PROCESSING_MAIN_SOURCE_PROCESSING_COMPONENT_H_
#define WEBRTC_MODULES_AUDIO_PROCESSING_MAIN_SOURCE_PROCESSING_COMPONENT_H_

#ifdef WEBRTC_ANDROID
template <class T> class Vector {
    public:
        Vector(): m_elems((T*)0), m_size(0) {}
        ~Vector() {}

        bool empty() const {
            return (bool)(m_size <= 0);
        }

        void pop_back() {
            if(!empty()) {
                m_size--;
                m_elems = (T*) realloc(m_elems, sizeof(T)*m_size);
            }
        }

        T back() const {
            if(empty())
                return (T)(0);
            else
                return m_elems[m_size-1];
        }

        int size() const { return m_size; }

        T& operator[](const int index) const {
            /*if(index >= m_size) {
                m_size = index + 1;
                m_elems = (T*) realloc(m_elems, sizeof(T)*m_size);
            }*/

            return m_elems[index];
        }

        void resize(int newSize, T initVal) {
            if(newSize < m_size) {
                m_size = newSize;
                m_elems = (T*) realloc(m_elems, sizeof(T)*m_size);
            }
            else if(newSize > m_size) {
                m_elems = (T*) realloc(m_elems, sizeof(T)*newSize);
                for(int i=m_size; i<newSize; i++)
                    m_elems[i] = initVal;
                m_size = newSize;
            }
        }

    protected:
        T* m_elems;
        int m_size;
};
#else
#include <vector>
#endif

#include "audio_processing.h"

namespace webrtc {
class AudioProcessingImpl;

class ProcessingComponent {
 public:
  explicit ProcessingComponent(const AudioProcessingImpl* apm);
  virtual ~ProcessingComponent();

  virtual int Initialize();
  virtual int Destroy();
  virtual int get_version(char* version, int version_len_bytes) const = 0;

  bool is_component_enabled() const;

 protected:
  virtual int Configure();
  int EnableComponent(bool enable);
  void* handle(int index) const;
  int num_handles() const;

 private:
  virtual void* CreateHandle() const = 0;
  virtual int InitializeHandle(void* handle) const = 0;
  virtual int ConfigureHandle(void* handle) const = 0;
  virtual int DestroyHandle(void* handle) const = 0;
  virtual int num_handles_required() const = 0;
  virtual int GetHandleError(void* handle) const = 0;

  const AudioProcessingImpl* apm_;
  Vector<void*> handles_;
  bool initialized_;
  bool enabled_;
  int num_handles_;
};
}  // namespace webrtc

#endif  // WEBRTC_MODULES_AUDIO_PROCESSING_MAIN_SOURCE_PROCESSING_COMPONENT_H__
