var TRANSFER_RATE_UPDATE_INTERVAL = 200,
  TRANSFER_ITEMS_MIN_UPDATE = 8192,
  TRANSFER_RATE_SAMPLES_MAX = 10,
  TRANSFER_COMPLETE_MODAL_HIDE_DELAY = 700,
  AUTOSAVE_DELAY_MS = 3e3,
  MAX_CONCURRENT_UPLOADS = 1,
  MAX_UPLOAD_BYTES = -1,
  UPLOAD_ACTION = "uploadFileToNewDirectory",
  UPLOAD_ARCHIVE_ACTION = "uploadArchive",
  API_PATH = "application/api/api.php",
  DOWNLOAD_PATH = "application/api/download.php",
  UPLOAD_PATH = "application/api/upload.php",
  CHUNKED_UPLOAD_PATH = "application/api/upload-chunked.php",
  MULTI_STAGE_UPLOAD_PATH = "application/api/upload-multistage.php",
  DEBUG = !1,
  FEATURE_MULTI_STAGE_UPLOAD = !1,
  FEATURE_CHUNKED_UPLOAD = !0,
  RELEASE_NOTES_URL = "https://www.monstaftp.com/notes",
  MFTP_DOWNLOAD_URL = "https://www.monstaftp.com/download",
  MFTP_UPGRADE_TRIAL_URL = "https://www.monstaftp.com/freetrial",
  MFTP_UPGRADE_PURCHASE_URL = "https://www.monstaftp.com/upgrade",
  g_ConnectionDefaults = { ftp: { port: 21 }, sftp: { port: 22 } };
function monstaLatestVersionCallback(e) {
  window.MONSTA_LATEST_VERSION = e;
  var t = document.createEvent("CustomEvent");
  t.initEvent("latestVersionLoadEVent", !0, !0), document.dispatchEvent(t);
}
function allInterfaceOptionsDisabled(e, t) {
  if (null === t) return !1;
  if (Object.keys(t).length !== e.length) return !1;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      if (!1 !== t[n]) return !1;
      if (-1 === e.indexOf(n)) return !1;
    }
  return !0;
}
function basicURLValidate(e) {
  return new RegExp("^\\s*https?://.+", "i").test(e);
}
function extractFileExtension(e) {
  if ("string" != typeof e) return "";
  var t = e.split(".");
  return 1 == t.length || (2 == t.length && "" == t[0])
    ? ""
    : t[t.length - 1].toLowerCase();
}
function isArchiveFilename(e) {
  switch (extractFileExtension(e)) {
    case "zip":
    case "tar":
    case "gz":
      return !0;
    default:
      return !1;
  }
}
function isExtractSupported(e) {
  return isArchiveFilename(e);
}
function isEmpty(e) {
  return null == e || "" === e;
}
function ensureTrailingSlash(e) {
  return "/" != e.substr(e.length - 1, 1) ? e + "/" : e;
}
function isSubPath(e, t) {
  return (
    !(t.length < e.length) &&
    ((e = ensureTrailingSlash(e)),
    (t = ensureTrailingSlash(t)).substr(0, e.length) == e)
  );
}
function nameJoin(e) {
  switch (e.length) {
    case 0:
      return "";
    case 1:
      return e[0];
    default:
      for (var t = "", n = 0; n < e.length - 1; ++n)
        (t += e[n]), n < e.length - 2 && (t += ", ");
      return (t += " and " + e[e.length - 1]);
  }
}
function normalizeFileSize(e) {
  if ("number" != typeof e) return "";
  for (
    var t = "B",
      n = e,
      o = [
        [1099511627776, "TB"],
        [1073741824, "GB"],
        [1048576, "MB"],
        [1024, "KB"],
      ],
      i = 0;
    i < o.length;
    ++i
  )
    if (e >= o[i][0]) {
      (n = (n = e / o[i][0]).toFixed(1)), (t = o[i][1]);
      break;
    }
  return "KB" == t && (n = Math.round(n)), n + t;
}
function objectValueIsSetAndFalse(e, t) {
  return e.hasOwnProperty(t) && !1 === e[t];
}
function objectMultipleValuesAreSetAndFalse(e, t) {
  for (var n = 0; n < t.length; ++n)
    if (!objectValueIsSetAndFalse(e, t[n])) return !1;
  return !0;
}
function setAllObjectValuesFalseForKeys(e, t) {
  for (var n = 0; n < t.length; ++n) e[t[n]] = !1;
}
function normalizeFooterDisplayOptions(e) {
  var t = ["upload-file", "upload-folder", "upload-archive"];
  objectValueIsSetAndFalse(e, "upload")
    ? setAllObjectValuesFalseForKeys(e, t)
    : objectMultipleValuesAreSetAndFalse(e, t) && (e.upload = !1);
  var n = ["new-folder", "new-file"];
  objectValueIsSetAndFalse(e, "new-item")
    ? setAllObjectValuesFalseForKeys(e, n)
    : objectMultipleValuesAreSetAndFalse(e, n) && (e["new-item"] = !1);
  var o = ["remote-server", "username", "upload-limit", "version"];
  return (
    objectValueIsSetAndFalse(e, "session-information")
      ? setAllObjectValuesFalseForKeys(e, o)
      : objectMultipleValuesAreSetAndFalse(e, o) &&
        (e["session-information"] = !1),
    e
  );
}
function objectKeyIsFalse(e, t) {
  return !!e.hasOwnProperty(t) && !1 === e[t];
}
function parentPath(e) {
  if (e.length <= 1) return "/";
  for (
    var t = "/" == e.substr(0, 1);
    e.length && "/" == e.substr(e.length - 1, 1);

  )
    e = e.substr(0, e.length - 1);
  for (var n = [], o = e.split("/"), i = 0; i < o.length - 1; ++i) {
    var r = o[i];
    0 != r.length && n.push(r);
  }
  return 0 == n.length ? "/" : (t ? "/" : "") + n.join("/");
}
function safeConsoleError(e) {
  window.console && window.console.error && console.error(e);
}
function parseErrorResponse(e, t) {
  if (
    (safeConsoleError(e),
    "string" == typeof e &&
      ((e = { data: (e = JSON.parse(e)) }), console.log(e)),
    console.log(typeof e),
    e.data && e.data.errors)
  )
    return e.data.errors.join(" ");
  var n = isEmpty(t) ? "" : " during " + t;
  return 408 == e.status || -1 == e.status
    ? "OPERATION_TIMEOUT"
    : "An unknown error occurred" + n + ".";
}
function getLocalizedErrorFromResponse(e) {
  return void 0 === e.data || null === e.data
    ? null
    : getLocalizedErrorFromResponseData(e.data);
}
function getLocalizedErrorFromResponseData(e) {
  return e && e.localizedErrors && 0 != e.localizedErrors.length
    ? e.localizedErrors[0]
    : null;
}
function getErrorMessageFromResponseData(e) {
  return e && e.errors && 0 != e.errors.length ? e.errors[0] : null;
}
function pathJoin(e, t) {
  var n = "/" == e.substr(e.length - 1, 1) || "" == e ? "" : "/";
  return e + n + t;
}
function responseIsUnsuccessful(e) {
  return null == e.data || 1 != e.data.success;
}
function showResponseErrorWithTranslatedAction(e, t, n, o) {
  if (e.data && e.data.localizedErrors) {
    var i = e.data.localizedErrors.length,
      r = [];
    function a(e) {
      r.push(e), r.length == i && n.$broadcast("modal-error:show", r.join(" "));
    }
    for (var s = 0; s < i; ++s) {
      var l = e.data.localizedErrors[s];
      void 0 === l.context || l.context,
        safeConsoleError(e.data),
        null == l.context && (l.context = {}),
        null == l.context.operation && (l.context.operation = t),
        o(l.context.operation).then(
          function (e) {
            (l.context.operation = e), o(l.errorName, l.context).then(a, a);
          },
          function () {
            o(l.errorName, l.context).then(a, a);
          }
        );
    }
  } else
    n.$broadcast("modal-error:show", parseErrorResponse(e, t), null, {
      action: t,
    });
}
function showResponseError(e, t, n, o) {
  o(t).then(
    function (t) {
      showResponseErrorWithTranslatedAction(e, t, n, o);
    },
    function () {
      showResponseErrorWithTranslatedAction(e, t, n, o);
    }
  );
}
function splitFileExtension(e) {
  var t = !1;
  "." == e.substr(0, 1) && ((e = e.substr(1, e.length - 1)), (t = !0));
  var n,
    o = e.split("."),
    i = "";
  return (
    o.length > 1
      ? ((i = "." + o[o.length - 1]), (n = o.slice(0, o.length - 1).join(".")))
      : (n = o[0]),
    [(t ? "." : "") + n, i]
  );
}
function b64EncodeUnicode(e) {
  return btoa(
    encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, function (e, t) {
      return String.fromCharCode(parseInt("0x" + t));
    })
  );
}
function b64DecodeUnicode(e) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(e), function (e) {
        return "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}
function validateFileNameNonEmpty(e) {
  return "" != e;
}
function validateFileNameContainsNoSlash(e) {
  return -1 == e.indexOf("/");
}
function mapParseInt(e) {
  return parseInt(e);
}
function simpleCompare(e, t) {
  return e - t;
}
function betaVersionComponentCompare(e, t) {
  var n = -1 != e.indexOf("b"),
    o = -1 != t.indexOf("b"),
    i = e.split("b").map(mapParseInt),
    r = t.split("b").map(mapParseInt);
  if (n && o) {
    var a = simpleCompare(i[0], r[0]);
    return 0 != a ? a : simpleCompare(i[1], r[1]);
  }
  return n ? (i[0] > r[0] ? 1 : -1) : r[0] > i[0] ? 1 : -1;
}
function versionComponentCompare(e, t) {
  return -1 != e.indexOf("b") || -1 != t.indexOf("b")
    ? betaVersionComponentCompare(e, t)
    : simpleCompare(parseInt(e), parseInt(t));
}
function versionIsLessThan(e, t) {
  for (var n = e.split("."); n.length < 4; ) n.push("0");
  for (var o = t.split("."); o.length < 4; ) o.push("0");
  for (var i = 0; i < n.length; ++i) {
    var r = versionComponentCompare(n[i], o[i]);
    if (0 != r) return r < 0;
  }
  return !1;
}
function TransferStats(e) {
  (this.completedItems = -1),
    (this.previousCompletedItems = -1),
    (this.totalItems = e),
    (this.previousSampleTime = -1),
    (this._transferRateSamples = []),
    (this.transferType = "");
}
function ModalUpgradeRequiredController(e, t, n) {
  var o = "#modal-upgrade-required",
    i = this;
  function r() {
    "" === i.upgradeRequiredMessage &&
      n(["UPGRADE_TRIAL_LINK_TEXT", "UPGRADE_PURCHASE_LINK_TEXT"]).then(
        a,
        function (e) {}
      ),
      t(o).modal("show");
  }
  function a(e) {
    var t = "TRIAL_A_TAG_START" + e.UPGRADE_TRIAL_LINK_TEXT + "A_TAG_END",
      o = "PURCHASE_A_TAG_START" + e.UPGRADE_PURCHASE_LINK_TEXT + "A_TAG_END";
    n("UPGRADE_REQUIRED_MESSAGE", { trial_link: t, purchase_link: o }).then(
      s,
      function (e) {}
    );
  }
  function s(e) {
    (e = (e = e.replace(
      /TRIAL_A_TAG_START/g,
      '<a href="' +
        MFTP_UPGRADE_TRIAL_URL +
        '" target="mftp-new" rel="noopener noreferrer">'
    )).replace(
      /PURCHASE_A_TAG_START/g,
      '<a href="' +
        MFTP_UPGRADE_PURCHASE_URL +
        '" target="mftp-new" rel="noopener noreferrer">'
    )),
      (i.upgradeRequiredMessage = e.replace(/A_TAG_END/g, "</a>"));
  }
  (i.show = r),
    (i.hide = function () {
      t(o).modal("hide");
    }),
    (i.upgradeRequiredMessage = ""),
    e.$on("upgrade-required-modal:display", r);
}
function getMFP() {
  try {
    return [
      navigator.userAgent,
      [screen.height, screen.width, screen.colorDepth].join("x"),
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      $.map(navigator.plugins, function (e) {
        return [
          e.name,
          e.description,
          $.map(e, function (e) {
            return [e.type, e.suffixes].join("~");
          }).join(","),
        ].join("::");
      }).join(";"),
    ]
      .join("###")
      .hashCode();
  } catch (e) {
    return null;
  }
}
function getMUuid() {
  var e = "mftp-uuid";
  try {
    var t = localStorage.getItem(e);
    return (
      null == t &&
        ((t = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (e) {
            var t = (16 * Math.random()) | 0;
            return ("x" == e ? t : (3 & t) | 8).toString(16);
          }
        )),
        localStorage.setItem(e, t)),
      t.replace(/-/g, "")
    );
  } catch (e) {
    return getMFP();
  }
}
function getFpQs() {
  var e = getMUuid();
  return null == e ? "" : "&amp;fp=" + e;
}
function rot13(e) {
  return e.replace(/[a-zA-Z]/g, function (e) {
    return String.fromCharCode(
      (e <= "Z" ? 90 : 122) >= (e = e.charCodeAt(0) + 13) ? e : e - 26
    );
  });
}
function mCheckFn(e) {
  if ((document.removeEventListener("load", mCheckFn), 1 != e.lType)) {
    window.setTimeout(function () {}, (Math.random() % 8e3) + 1e4);
    "string".substr(0, 3);
    for (
      var t = (!0 + "").substr(0, 1),
        n = (!1 + "").substr(2, 1),
        o = (!1 + "").substr(4, 1),
        i = (!1 + "").substr(2, 1),
        r = document.getElementsByTagName(t + "i" + t + n + o)[0],
        a = "Monsta " + ("fT" + String.fromCharCode(80)).toUpperCase(),
        s = r.text !== a,
        l = "o",
        c = window,
        u = (c.alert, document.getElementsByClassName("toolbar")),
        d = 2 !== u.length,
        f = 0;
      f < u.length;
      ++f
    ) {
      var h = u[f],
        p = window.getComputedStyle(h).backgroundColor;
      if (-1 === p.indexOf("53, 53, 53") && -1 === p.indexOf("353535")) {
        !0;
        break;
      }
    }
    for (
      var m = i + l + "g" + l,
        g = document.getElementsByClassName(m),
        y = !1,
        v = 0;
      v < g.length;
      ++v
    ) {
      if (g[v].tagName === "SP" + (!1 + "").substr(1, 1).toUpperCase() + "N")
        y =
          -1 ==
          (g[v].currentStyle || c.getComputedStyle(g[v], null)).backgroundImage
            .slice(4, -1)
            .indexOf("monsta-" + i + "og" + l + "-400w.png");
    }
    var E = String,
      A = "len" + "g_".substr(0, 1) + "th",
      S = s || d || y;
    if (((window.g_loadComplete = !S), S)) {
      for (
        var T = [
            164, 202, 196, 228, 194, 220, 200, 210, 220, 206, 64, 222, 204,
          ],
          R = 0;
        R < T[A];
        ++R
      )
        E.fromCharCode(T[R] / 2);
      " " + a + " ";
      for (
        var C = [
            52.5, 57.5, 16, 55.5, 55, 54, 60.5, 16, 56, 50.5, 57, 54.5, 52.5,
            58, 58, 50.5, 50, 16, 59.5, 52.5, 58, 52, 16, 58, 52, 50.5, 16,
            34.5, 55, 58, 50.5, 57, 56, 57, 52.5, 57.5, 50.5, 16, 34.5, 50,
            52.5, 58, 52.5, 55.5, 55, 23, 16, 33.5, 54, 52.5, 49.5, 53.5, 16,
            39.5, 37.5, 23.5, 33.5, 54, 55.5, 57.5, 50.5, 16, 51, 55.5, 57, 16,
            54.5, 55.5, 57, 50.5, 16, 50, 50.5, 58, 48.5, 52.5, 54, 57.5, 23,
          ],
          _ = 0;
        _ < C[A];
        ++_
      )
        E.fromCharCode(2 * C[_]);
      for (
        var w = [
            [s, "title"],
            [d, "toolbarCount"],
            [y, "logoUrlChanged"],
          ],
          I = "",
          P = 0;
        P < w.length;
        ++P
      )
        w[P][0] && (I += w[P][1] + ",");
      var F =
          "https://monstaftp.com/failure-record.php?" +
          ("c=" +
            encodeURIComponent(I) +
            "&loc=" +
            encodeURIComponent(window.location)),
        b = document.createElement("script");
      b.setAttribute("src", F), document.head.appendChild(b);
    }
    for (
      var D = document.getElementsByTagName("style"), L = 0;
      L < D.length;
      ++L
    ) {
      var O = D[L];
      if (null != O.text && null != O.text.indexOf)
        if (-1 == O.text.indexOf("ng-cloak")) O.parentNode.removeChild(O);
    }
    for (
      var x = document.getElementsByTagName("link"), U = 0;
      U < x.length;
      ++U
    ) {
      var N = x[U];
      if ("stylesheet" == N.getAttribute("rel")) {
        var M = N.getAttribute("href");
        null != M &&
          0 != M.indexOf("//ajax.googleapis.com") &&
          0 != M.indexOf("//maxcdn.bootstrapcdn.com") &&
          0 != M.indexOf("//fonts.googleapis.com") &&
          0 != M.indexOf("//cdnjs.cloudflare.com") &&
          "application/frontend/css/monsta.css" != M &&
          N.parentNode.removeChild(N);
      }
    }
  }
}
angular.module("MonstaFTP", ["pascalprecht.translate"]),
  angular.module("MonstaFTP").config([
    "$httpProvider",
    function (e) {
      "use strict";
      var t = 0;
      e.interceptors.push([
        "$rootScope",
        "$q",
        function (e, n) {
          var o = function (n) {
            (t += n), e.$broadcast("request-count-change", t);
          };
          return {
            request: function (e) {
              return e.__ignoreStatusIndicator || o(1), e;
            },
            responseError: function (e) {
              return (
                safeConsoleError(e),
                e.config.__ignoreStatusIndicator || o(-1),
                n.reject(e)
              );
            },
            response: function (e) {
              return e.config.__ignoreStatusIndicator || o(-1), e;
            },
          };
        },
      ]);
    },
  ]),
  angular.module("MonstaFTP").config([
    "$translateProvider",
    function (e) {
      "use strict";
      if (
        (e.useSanitizeValueStrategy("escape"),
        window.underTest ||
          e.useStaticFilesLoader({
            prefix: "application/languages/",
            suffix: ".json",
          }),
        e.useMessageFormatInterpolation(),
        e.fallbackLanguage("en_us"),
        window.localStorage)
      )
        try {
          var t = localStorage.getItem("monsta-setting-language");
          t && (g_defaultLanguage = JSON.parse(t));
        } catch (e) {}
      e.preferredLanguage(g_defaultLanguage);
    },
  ]),
  angular.module("MonstaFTP").config([
    "$locationProvider",
    function (e) {
      e.hashPrefix("");
    },
  ]),
  angular.module("MonstaFTP").factory("authenticationFactory", function () {
    var e = "monsta-configuration",
      t = "monsta-connectionType",
      n = "monsta-initialDirectory",
      o = "monsta-rememberLogin",
      i = "monsta-isAuthenticated",
      r = "monsta-hasServerSavedAuthentication";
    return {
      isAuthenticated: !1,
      rememberLogin: !1,
      configuration: null,
      connectionType: null,
      initialDirectory: null,
      hasServerSavedAuthentication: !1,
      _localStorageSupported: null,
      getConfigurationAsJSON: function () {
        return JSON.stringify(this.configuration);
      },
      setConfigurationFromJSON: function (e) {
        this.configuration = null == e ? null : JSON.parse(e);
      },
      localStorageSupported: function () {
        if (null == this._localStorageSupported) {
          var e = "test",
            t = window.localStorage;
          try {
            t.setItem(e, "1"),
              t.removeItem(e),
              (this._localStorageSupported = !0);
          } catch (e) {
            this._localStorageSupported = !1;
          }
        }
        return this._localStorageSupported;
      },
      postLogin: function () {
        (this.isAuthenticated = !0), this.saveSettings();
      },
      loadSettings: function () {
        this.localStorageSupported() &&
          (this.loadMetaConfiguration(),
          this.rememberLogin && this.loadConfiguration());
      },
      saveSettings: function () {
        this.localStorageSupported() &&
          (this.saveMetaConfiguration(),
          this.rememberLogin
            ? this.saveConfiguration()
            : this.clearConfiguration());
      },
      clearSettings: function () {
        this.localStorageSupported() &&
          (this.rememberLogin || this.clearConfiguration());
      },
      logout: function () {
        (this.isAuthenticated = !1),
          (this.initialDirectory = null),
          this.saveSettings(),
          this.clearSettings(),
          (this.configuration = null);
      },
      loadConfiguration: function () {
        this.localStorageSupported() &&
          (this.setConfigurationFromJSON(localStorage.getItem(e)),
          (this.connectionType = localStorage.getItem(t)),
          (this.initialDirectory = localStorage.getItem(n)));
      },
      saveConfiguration: function () {
        this.localStorageSupported() &&
          (localStorage.setItem(e, this.getConfigurationAsJSON()),
          localStorage.setItem(t, this.connectionType),
          localStorage.setItem(n, this.initialDirectory));
      },
      clearConfiguration: function () {
        localStorage.removeItem(e),
          localStorage.removeItem(t),
          localStorage.removeItem(n);
      },
      loadMetaConfiguration: function () {
        this.localStorageSupported() &&
          ((this.rememberLogin = "true" === localStorage.getItem(o)),
          (this.isAuthenticated = "true" === localStorage.getItem(i)),
          (this.hasServerSavedAuthentication =
            "true" === localStorage.getItem(r)));
      },
      saveMetaConfiguration: function () {
        this.localStorageSupported() &&
          (localStorage.setItem(
            i,
            1 == this.isAuthenticated ? "true" : "false"
          ),
          localStorage.setItem(o, 1 == this.rememberLogin ? "true" : "false"),
          localStorage.setItem(
            r,
            1 == this.hasServerSavedAuthentication ? "true" : "false"
          ));
      },
      hasStoredAuthenticationDetails: function () {
        return !isEmpty(this.connectionType) && !isEmpty(this.configuration);
      },
      getActiveConfiguration: function () {
        if (null === this.configuration) return null;
        var e = this.configuration[this.connectionType];
        return (
          void 0 !== e.port && null != e.port && (e.port = parseInt(e.port)), e
        );
      },
      clearAuthConfiguration: function () {
        this.localStorageSupported() && localStorage.removeItem(e);
      },
    };
  }),
  (function () {
    function e(e, t, n) {
      var o = {
          getSystemConfiguration: function () {
            (null === i || r) && (i = e.getSystemVars().then(c, u));
            return i;
          },
          saveApplicationSettings: function () {
            return e.setApplicationSettings(a.applicationSettings);
          },
          setApplicationSetting: function (e, t) {
            if (null == a) return;
            null == a.applicationSettings && (a.applicationSettings = {});
            var o = a.applicationSettings[e] != t;
            (a.applicationSettings[e] = t),
              o && n.$broadcast("configuration:key-changed", e, t);
          },
          getApplicationSetting: function (e) {
            return (function (e) {
              return (
                !!g_isMonstaPostEntry &&
                -1 != s.indexOf(e) &&
                null != g_monstaPostEntryVars.settings &&
                null != g_monstaPostEntryVars.settings[e]
              );
            })(e)
              ? (function (e) {
                  return g_monstaPostEntryVars.settings[e];
                })(e)
              : null == a
              ? null
              : a.applicationSettings[e];
          },
          setServerCapability: function (e, t) {
            if (l[e] === t) return;
            (l[e] = t), n.$broadcast("server-capability:key-changed", e, t);
          },
          getServerCapability: function (e) {
            return l[e];
          },
        },
        i = null,
        r = !1,
        a = null,
        s = ["postLogoutUrl", "loginFailureRedirect"],
        l = {};
      function c(e) {
        return (a = e.data.data);
      }
      function u(e) {
        return (r = !0), t.reject(e);
      }
      return o;
    }
    angular.module("MonstaFTP").factory("configurationFactory", e),
      (e.$inject = ["connectionFactory", "$q", "$rootScope"]);
  })(),
  (function () {
    function e(e, t) {
      var n = {
          getApplicationSettings: function () {
            return e.getSystemConfiguration().then(function (e) {
              r = e.applicationSettings;
            }, c);
          },
          getConfigurationItem: function (e) {
            return null == l(e) ? r[e] : l(e);
          },
          setConfigurationItem: function (e, n) {
            var o = l(e) != n;
            s(e, n), o && t.$broadcast("configuration:key-changed", e, n);
          },
        },
        o = null,
        i = {},
        r = {};
      function a() {
        if (null == o) {
          var e = "test",
            t = window.localStorage;
          try {
            t.setItem(e, "1"), t.removeItem(e), (o = !0);
          } catch (e) {
            o = !1;
          }
        }
        return o;
      }
      function s(e, t) {
        (e = "monsta-setting-" + e),
          a()
            ? (function (e, t) {
                localStorage.setItem(e, JSON.stringify(t));
              })(e, t)
            : (i[e] = t);
      }
      function l(e) {
        return (
          (e = "monsta-setting-" + e),
          a()
            ? (function (e) {
                var t = localStorage.getItem(e);
                return "string" == typeof t ? JSON.parse(t) : t;
              })(e)
            : i[e]
        );
      }
      function c(e) {
        return $q.reject(e);
      }
      return n;
    }
    angular.module("MonstaFTP").factory("localConfigurationFactory", e),
      (e.$inject = ["configurationFactory", "$rootScope"]);
  })(),
  (function () {
    function e(e, t, n) {
      var o = this;
      function i(e) {
        return (
          e.preventDefault(), o.changeDirectoryToItem(n(this).data("index")), !1
        );
      }
      function r(e, t) {
        var o = n('<li class="breadcrumb-display"></li>'),
          r = n('<a href="#" data-index="' + t + '"></a>').text(e + " ");
        return r.click(i), o.append(r), o;
      }
      (o.pathComponents = []),
        (o.hasLeadingSlash = !1),
        (o.renderBreadcrumbs = function () {
          var e = n("#breadcrumb-ol"),
            t = n("#breadcrumb__home_link"),
            i = n("#history > button"),
            a = n(window).width(),
            s = a - i.width() - 120,
            l = 0;
          e.find(".breadcrumb-display").remove();
          for (
            var c = o.pathComponents.length - 1, u = null, d = c;
            d >= 0;
            --d
          ) {
            var f = r(o.pathComponents[d], d + 1);
            if (
              (null === u && (u = f), t.after(f), (l += f.outerWidth()) > s)
            ) {
              if ((d != c && f.remove(), 0 != c)) {
                var h = r("…", d + 1);
                t.after(h);
              }
              break;
            }
          }
          if (l > s)
            for (var p = 1; u.offset().left + u.outerWidth() + 15 > a; ) {
              ++p;
              var m = o.pathComponents[c],
                g = m.length,
                y = m.substr(0, g - p);
              if (((y += "…"), u.text(y), g - p == 1)) break;
            }
        }),
        (this.setPath = function (e) {
          if ("string" != typeof e || 0 == e.length)
            return (o.pathComponents = []), void (o.hasLeadingSlash = !1);
          (o.hasLeadingSlash = "/" == e.substr(0, 1)),
            "/" == e
              ? (o.pathComponents = [])
              : ((o.pathComponents = e.split("/")),
                "" == o.pathComponents[0] && o.pathComponents.splice(0, 1),
                "" == o.pathComponents[o.pathComponents.length - 1] &&
                  o.pathComponents.splice(o.pathComponents.length - 1, 1));
          o.renderBreadcrumbs();
        }),
        (this.changeDirectoryToItem = function (e) {
          var n = "";
          0 != e && (n = o.pathComponents.slice(0, e).join("/"));
          var i = (o.hasLeadingSlash ? "/" : "") + n;
          t.$broadcast("change-directory", i);
        }),
        e.$on("directory-changed", function (e, t) {
          o.setPath(t);
        }),
        e.$on("logout", function () {
          o.setPath("/");
        }),
        n(window).resize(function () {
          o.renderBreadcrumbs();
        });
    }
    angular.module("MonstaFTP").controller("BreadcrumbController", e),
      (e.$inject = ["$scope", "$rootScope", "jQuery"]);
  })(),
  (function () {
    function e(e, t, n) {
      var o = window.g_xhrTimeoutSeconds || 30,
        i = [
          "downloadMultipleFiles",
          "fetchFile",
          "fetchRemoteFile",
          "copy",
          "extractArchive",
          "deleteMultiple",
          "transferUploadToRemote",
        ],
        r = function (e, t, n) {
          (e.actionName = t), (e.context = { remotePath: n });
        },
        a = function (e, t, n, o) {
          (e.actionName = t), (e.context = { source: n, destination: o });
        };
      return {
        _sendRequest: function (t, r, a) {
          var s,
            l = -1 == i.indexOf(t.actionName) ? 1e3 * o : null;
          if (a) {
            var c = n.defer(),
              u = function (e) {
                c.resolve(e);
              };
            s = c.promise;
          } else s = l;
          var d = {
            method: "POST",
            url: API_PATH,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            transformRequest: function (e) {
              var t = [];
              for (var n in e)
                e.hasOwnProperty(n) &&
                  t.push(
                    encodeURIComponent(n) +
                      "=" +
                      encodeURIComponent(JSON.stringify(e[n]))
                  );
              return t.join("&");
            },
            timeout: s,
            data: { request: t },
            __ignoreStatusIndicator: !!r,
          };
          DEBUG && console.log(d);
          var f = e(d);
          return a ? { promise: f, cancel: u } : f;
        },
        getRequestBody: function () {
          var e = angular.copy(t.getActiveConfiguration());
          if (null !== e) {
            var n = g_ConnectionDefaults[t.connectionType];
            if (n)
              for (var o in n)
                n.hasOwnProperty(o) &&
                  ((null != e[o] && null != e[o] && "" != e[o]) ||
                    (e[o] = n[o]));
          }
          return { connectionType: t.connectionType, configuration: e };
        },
        getEmptyRequestBody: function () {
          return { connectionType: null, configuration: null };
        },
        getListDirectoryRequest: function (e, t, n) {
          (e.actionName = "listDirectory"),
            (e.context = { path: t, showHidden: n });
        },
        getFetchFileRequest: function (e, t) {
          r(e, "fetchFile", t);
        },
        getMakeDirectoryRequest: function (e, t) {
          r(e, "makeDirectory", t);
        },
        getDeleteDirectoryRequest: function (e, t) {
          r(e, "deleteDirectory", t);
        },
        getDeleteFileRequest: function (e, t) {
          r(e, "deleteFile", t);
        },
        getCopyRequest: function (e, t, n) {
          a(e, "copy", t, n);
        },
        getRenameRequest: function (e, t, n, o) {
          a(e, "rename", t, n), o && (e.context.action = "move");
        },
        getCreateZipRequest: function (e, t, n, o) {
          (e.actionName = "createZip"),
            (e.context = { baseDirectory: t, items: n, dest: o });
        },
        getChangePermissionsRequest: function (e, t, n) {
          r(e, "changePermissions", t), (e.context.mode = n);
        },
        getPutFileContentsRequest: function (e, t, n, o, i, r) {
          (e.actionName = "putFileContents"),
            (e.context = {
              remotePath: t,
              fileContents: n,
              originalFileContents: o,
              confirmOverwrite: !0 === r,
            }),
            i && (e.context.encoding = "rot13");
        },
        getGetFileContentsRequest: function (e, t) {
          (e.actionName = "getFileContents"), (e.context = { remotePath: t });
        },
        getTestConnectAndAuthenticateRequest: function (e, t) {
          (e.actionName = "testConnectAndAuthenticate"),
            (e.context = { getServerCapabilities: t });
        },
        getCheckSavedAuthExistsRequest: function (e) {
          (e.actionName = "checkSavedAuthExists"), (e.context = {});
        },
        getWriteSavedAuthRequest: function (e, t, n) {
          (e.actionName = "writeSavedAuth"),
            (e.context = { password: t, authData: n });
        },
        getReadSavedAuthRequest: function (e, t) {
          (e.actionName = "readSavedAuth"), (e.context = { password: t });
        },
        getReadLicenseRequest: function (e) {
          (e.actionName = "readLicense"), (e.context = {});
        },
        getGetSystemVarsRequest: function (e) {
          (e.actionName = "getSystemVars"), (e.context = {});
        },
        getFetchRemoteFileRequest: function (e, t, n) {
          a(e, "fetchRemoteFile", t, n);
        },
        getDownloadMultipleFilesRequest: function (e, t, n) {
          (e.actionName = "downloadMultipleFiles"),
            (e.context = { baseDirectory: t, items: n });
        },
        getSetApplicationSettingsRequest: function (e, t) {
          (e.actionName = "setApplicationSettings"),
            (e.context = { applicationSettings: t });
        },
        getDeleteMultipleRequest: function (e, t) {
          (e.actionName = "deleteMultiple"), (e.context = { pathsAndTypes: t });
        },
        getExtractArchiveRequest: function (e, t, n, o) {
          (e.actionName = "extractArchive"),
            (e.context = { fileKey: t, fileIndexOffset: n, extractCount: o });
        },
        getUpdateLicenseRequest: function (e, t) {
          (e.actionName = "updateLicense"), (e.context = { license: t });
        },
        getReserveUploadContextRequest: function (e, t, n) {
          (e.actionName = "reserveUploadContext"),
            (e.context = { actionName: t, remotePath: n });
        },
        getTransferUploadToRemoteRequest: function (e, t) {
          (e.actionName = "transferUploadToRemote"),
            (e.context = { sessionKey: t });
        },
        getGetRemoteFileSizeRequest: function (e, t) {
          (e.actionName = "getRemoteFileSize"), (e.context = { remotePath: t });
        },
        getGetDefaultPathRequest: function (e) {
          e.actionName = "getDefaultPath";
        },
        getDownloadForExtractRequest: function (e, t) {
          (e.actionName = "downloadForExtract"),
            (e.context = { remotePath: t });
        },
        getCleanUpExtractRequest: function (e, t) {
          (e.actionName = "cleanUpExtract"), (e.context = { fileKey: t });
        },
        getForgotPasswordRequest: function (e, t) {
          (e.actionName = "forgotPassword"), (e.context = { username: t });
        },
        getResetPasswordRequest: function (e, t, n, o) {
          (e.actionName = "resetPassword"),
            (e.context = { username: t, currentPassword: n, newPassword: o });
        },
        getValidateSavedAuthPasswordRequest: function (e, t) {
          (e.actionName = "validateSavedAuthPassword"),
            (e.context = { password: t });
        },
        getDownloadLatestVersionArchiveRequest: function (e, t) {
          (e.actionName = "downloadLatestVersionArchive"),
            (e.context = { password: t });
        },
        getInstallLatestVersionRequest: function (e, t) {
          (e.actionName = "installLatestVersion"),
            (e.context = { password: t });
        },
        listDirectory: function (e, t) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getListDirectoryRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        fetchFile: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getFetchFileRequest(this.requestBody, e, !0),
            this._sendRequest(this.requestBody)
          );
        },
        rename: function (e, t, n) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getRenameRequest(this.requestBody, e, t, n),
            this._sendRequest(this.requestBody)
          );
        },
        createZip: function (e, t, n) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getCreateZipRequest(this.requestBody, e, t, n),
            this._sendRequest(this.requestBody)
          );
        },
        changePermissions: function (e, t) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getChangePermissionsRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        copy: function (e, t) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getCopyRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        deleteFile: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getDeleteFileRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        deleteDirectory: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getDeleteDirectoryRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        makeDirectory: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getMakeDirectoryRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        getFileContents: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getGetFileContentsRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        putFileContents: function (e, t, n, o, i, r) {
          this.requestBody = this.getRequestBody();
          var a = b64EncodeUnicode(t),
            s = i ? rot13(a) : a,
            l = null;
          if (null != n) {
            var c = b64EncodeUnicode(n);
            l = i ? rot13(c) : c;
          }
          return (
            this.getPutFileContentsRequest(this.requestBody, e, s, l, i, r),
            this._sendRequest(this.requestBody, o)
          );
        },
        testConnectAndAuthenticate: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getTestConnectAndAuthenticateRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        checkSavedAuthExists: function () {
          return (
            (this.requestBody = this.getEmptyRequestBody()),
            this.getCheckSavedAuthExistsRequest(this.requestBody),
            this._sendRequest(this.requestBody)
          );
        },
        writeSavedAuth: function (e, t) {
          return (
            (this.requestBody = this.getEmptyRequestBody()),
            this.getWriteSavedAuthRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        readSavedAuth: function (e) {
          return (
            (this.requestBody = this.getEmptyRequestBody()),
            this.getReadSavedAuthRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        getLicense: function () {
          return (
            (this.requestBody = this.getEmptyRequestBody()),
            this.getReadLicenseRequest(this.requestBody),
            this._sendRequest(this.requestBody)
          );
        },
        getSystemVars: function () {
          return (
            (this.requestBody = this.getEmptyRequestBody()),
            this.getGetSystemVarsRequest(this.requestBody),
            this._sendRequest(this.requestBody)
          );
        },
        fetchRemoteFile: function (e, t) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getFetchRemoteFileRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        downloadMultipleFiles: function (e, t) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getDownloadMultipleFilesRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        setApplicationSettings: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getSetApplicationSettingsRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        deleteMultiple: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getDeleteMultipleRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        extractArchive: function (e, t, n) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getExtractArchiveRequest(this.requestBody, e, t, n),
            this._sendRequest(this.requestBody, !0, !0)
          );
        },
        updateLicense: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getUpdateLicenseRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        reserveUploadContext: function (e, t) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getReserveUploadContextRequest(this.requestBody, e, t),
            this._sendRequest(this.requestBody)
          );
        },
        transferUploadToRemote: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getTransferUploadToRemoteRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        getRemoteFileSize: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getGetRemoteFileSizeRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        getDefaultPath: function () {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getGetDefaultPathRequest(this.requestBody),
            this._sendRequest(this.requestBody)
          );
        },
        downloadForExtract: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getDownloadForExtractRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        cleanUpExtract: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getCleanUpExtractRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        forgotPassword: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getForgotPasswordRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        resetPassword: function (e, t, n) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getResetPasswordRequest(this.requestBody, e, t, n),
            this._sendRequest(this.requestBody)
          );
        },
        validateSavedAuthPassword: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getValidateSavedAuthPasswordRequest(this.requestBody, e),
            this._sendRequest(this.requestBody)
          );
        },
        downloadLatestVersionArchive: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getDownloadLatestVersionArchiveRequest(this.requestBody, e),
            this._sendRequest(this.requestBody, !0)
          );
        },
        installLatestVersion: function (e) {
          return (
            (this.requestBody = this.getRequestBody()),
            this.getInstallLatestVersionRequest(this.requestBody, e),
            this._sendRequest(this.requestBody, !0)
          );
        },
      };
    }
    angular.module("MonstaFTP").factory("connectionFactory", e),
      (e.$inject = ["$http", "authenticationFactory", "$q"]);
  })(),
  (function () {
    function e(e, t, n, o, i, r, a, s, l, c, u, d, f, h, p, m, g, y) {
      "use strict";
      var v = this,
        E = !1,
        A = [],
        S = null,
        T = !1,
        R = [
          "open",
          "edit",
          "view",
          "download",
          "cut",
          "copy",
          "rename",
          "delete",
          "chmod",
          "properties",
          "extract",
        ],
        C = null,
        _ = !0,
        w = "FOLDER";
      function I() {
        null != v.systemVars &&
          1 == E &&
          v.changeDirectory(
            null == a.initialDirectory ? "/" : a.initialDirectory,
            !0
          );
      }
      function P(e) {
        return {
          position: "fixed",
          left: e.clientX + 7 + "px",
          top: e.clientY + 14 + "px",
          "margin-left": 0,
          "margin-top": 0,
        };
      }
      function F(e, t) {
        e.clientX + 7 + t.outerWidth() > l(window).width() &&
          t.css("margin-left", -(t.width() + 20)),
          (function (e, t) {
            return (
              e + t.outerHeight() > l(window).height() - l("#footer").height()
            );
          })(e.clientY + 14, t) && t.css("margin-top", -(t.height() + 20)),
          t.css("opacity", 1);
      }
      function b(e) {
        if (responseIsUnsuccessful(e))
          showResponseError(e, "DOWNLOAD_OPERATION", t, d);
        else {
          var n = e.data.fileKey;
          l("#download-iframe").attr("src", DOWNLOAD_PATH + "?fileKey=" + n);
        }
      }
      function D(e) {
        showResponseError(e, "DOWNLOAD_OPERATION", t, d),
          t.$broadcast("modal-prompt:clear-busy");
      }
      function L(e) {
        if (null != i.cutSource || null != i.copySource) {
          var n, r;
          null != i.cutSource
            ? ((n = i.cutSource), (r = "rename"))
            : ((n = i.copySource), (r = "copy"));
          for (var a = 0; a < n.length; ++a) {
            var s = n[a];
            if (isSubPath(s, i.currentDirectory))
              return void t.$broadcast(
                "modal-error:show",
                "PASTE_TO_SUB_DIRECTORY_ERROR"
              );
            var l = s.split("/"),
              c = j(l[l.length - 1], e),
              u = i.joinNameToCurrentDirectory(c);
            o[r](s, u, !0).then(
              function () {
                i.pasteComplete(),
                  v.changeDirectory(i.currentDirectory),
                  "rename" == r && t.$broadcast("items-moved", [[s, u]]);
              },
              function (e) {
                showResponseError(e, "FILE_PASTE_OPERATION", t, d);
              }
            );
          }
        }
      }
      function O(e) {
        t.$broadcast("modal-confirm:show", e, v.confirmDelete, v.cancelDelete);
      }
      function x() {
        (v.newItemPath = null), (e.makeItemType = null);
      }
      function U(e) {
        return validateFileNameNonEmpty(e)
          ? validateFileNameContainsNoSlash(e)
            ? null
            : "FILE_NAME_CONTAINS_SLASH_MESSAGE"
          : "FILE_NAME_EMPTY_MESSAGE";
      }
      function N(e, t) {
        d(e, t).then(q, q);
      }
      function M(e) {
        d(["NEW_ITEM_PROMPT_TITLE", "NEW_ITEM_NAME_PLACEHOLDER"], {
          item_type: e,
        }).then(function (e) {
          t.$broadcast(
            "modal-prompt:show",
            e.NEW_ITEM_PROMPT_TITLE,
            "",
            e.NEW_ITEM_NAME_PLACEHOLDER,
            v.makeItemOKCallback
          );
        });
      }
      function q(e) {
        t.$broadcast("modal-prompt:set-error", e);
      }
      function B(e) {
        t.$broadcast(
          "modal-prompt:show",
          e.RENAME_FILE_PROMPT_TITLE,
          v.renameSource,
          e.RENAME_FILE_NAME_PLACEHOLDER,
          v.fileRenameCallback
        );
      }
      function k(e) {
        (v.systemVars = e),
          v.setEditableExtensions(
            h.getApplicationSetting("editableFileExtensions")
          ),
          (v.isLicensed = g.isLicensed()),
          g.isLicensed()
            ? ((v.allowFileCreation = !0),
              (v.enableChmod =
                v.enableChmod && !h.getApplicationSetting("disableChmod")),
              (v.enableFileView = !h.getApplicationSetting("disableFileView")),
              (v.enableFileEdit =
                v.enableFileView &&
                !h.getApplicationSetting("disableFileEdit")),
              (v.contextMenuItemDisplay =
                h.getApplicationSetting("contextMenuItemDisplay") || {}),
              (v.browserColumnDisplay =
                h.getApplicationSetting("fileBrowserColumnDisplay") || {}),
              (v.archiveUploadAllowed = !0))
            : ((v.allowFileCreation = !1), (v.archiveUploadAllowed = !1)),
          I();
      }
      function G(e) {
        showResponseError(e, "SYSTEM_VAR_LOAD_OPERATION", t, d);
      }
      function H(t) {
        for (var n = 0; n < e.directoryList.length; ++n)
          if (e.directoryList[n].name == t) return !0;
        return !1;
      }
      function j(e, t) {
        var n = e;
        if (!H(n)) return n;
        var o = splitFileExtension(n);
        if (!H((n = o[0] + " - " + t + o[1]))) return n;
        for (var i = 2; ; ++i) {
          var r = o[0] + " - " + t + " " + i + o[1];
          if (!H(r)) return r;
        }
      }
      function V() {
        d(["CREATE_ZIP_PROMPT_TITLE", "CREATE_ZIP_FILE_NAME_PLACEHOLDER"]).then(
          z,
          z
        );
      }
      function z(e) {
        t.$broadcast(
          "modal-prompt:show",
          e.CREATE_ZIP_PROMPT_TITLE,
          v.createZipName,
          e.CREATE_ZIP_FILE_NAME_PLACEHOLDER,
          v.createZipCallback
        );
      }
      (e.directoryList = []),
        (e.selectedItems = f.getSelectedItems()),
        (e.directoriesToDelete = null),
        (e.filesToDelete = null),
        (e.isHistoryChangeDir = !1),
        (v.sortName = "name"),
        (v.sortReversed = !1),
        (v.renameSource = null),
        (v.createZipName = null),
        (v.rowDragStartIndex = null),
        (v.isMetaDrag = !1),
        (v.previousDragOverIndex = null),
        (v.uiOperationFactory = i),
        (v.systemVars = null),
        (v.enableChmod = !0),
        (v.enableFileView = !0),
        (v.enableFileEdit = !0),
        (v.allowFileCreation = !1),
        (v.createZipSource = []),
        (v.isLicensed = g.isLicensed()),
        (v.archiveUploadAllowed = g.isLicensed()),
        (v.contextMenuItemDisplay = {}),
        (v.browserColumnDisplay = {}),
        (v.didLogout = function () {
          (i.currentDirectory = null),
            (i.currentDirectoryList = []),
            (a.initialDirectory = null),
            (e.directoryList = []),
            s.clearHistory();
        }),
        (v.doReorder = function () {
          e.directoryList = v.sortDirectoryList(
            e.directoryList,
            v.sortName,
            v.sortReversed
          );
        }),
        (v.cancelDelete = function () {
          (e.filesToDelete = null), (e.directoriesToDelete = null);
        }),
        (v.performPaste = function () {
          d("EXISTING_FILE_SUFFIX").then(
            function (e) {
              L(e);
            },
            function () {
              L("Copy");
            }
          );
        }),
        (v.confirmDelete = function () {
          var n = [];
          null != e.filesToDelete &&
            e.filesToDelete.map(function (e) {
              i.isCutOrCopySource(e) && i.clearCutAndCopySource(),
                n.push([e, !1]);
            });
          null != e.directoriesToDelete &&
            e.directoriesToDelete.map(function (e) {
              i.isCutOrCopySource(e) && i.clearCutAndCopySource(),
                n.push([e, !0]);
            });
          o.deleteMultiple(n).then(
            function () {
              v.deleteComplete();
            },
            function (e) {
              showResponseError(e, "DELETE_ITEM_OPERATION", t, d),
                v.deleteComplete();
            }
          );
        }),
        (v.deleteComplete = function () {
          var n = [].concat(e.directoriesToDelete || [], e.filesToDelete || []);
          t.$broadcast("items-deleted", n),
            (e.directoriesToDelete = null),
            (e.filesToDelete = null),
            v.changeDirectory(i.currentDirectory);
        }),
        (v.downloadSingle = function () {
          var t = i.joinNameToCurrentDirectory(
            e.directoryList[f.getSelectedItems()[0]].name
          );
          v.downloadFileAtPath(t);
        }),
        (v.initiateRename = function () {
          d(["RENAME_FILE_PROMPT_TITLE", "RENAME_FILE_NAME_PLACEHOLDER"]).then(
            B,
            B
          );
        }),
        (v.changeDirectory = function (e, n, r) {
          p.getApplicationSettings().then(
            function () {
              var a;
              (a = r
                ? function () {}
                : function (e) {
                    n
                      ? o.getDefaultPath().then(
                          function (e) {
                            v.changeDirectory(e.data.data);
                          },
                          function () {
                            showResponseError(
                              e,
                              "DIRECTORY_CHANGE_OPERATION",
                              t,
                              d
                            );
                          }
                        )
                      : showResponseError(
                          e,
                          "DIRECTORY_CHANGE_OPERATION",
                          t,
                          d
                        );
                  }),
                o
                  .listDirectory(e, p.getConfigurationItem("showDotFiles"))
                  .then(function (t) {
                    v.directoryListSuccess(e, t, e != i.currentDirectory);
                  }, a);
            },
            function (e) {
              showResponseError(e, "APPLICATION_SETTINGS_LOAD_OPERATION", t, d);
            }
          );
        }),
        (v.downloadMultiple = function () {
          var t = f.getSelectedItems(),
            n = [];
          t.map(function (t) {
            n.push(e.directoryList[t].name);
          }),
            o.downloadMultipleFiles(i.currentDirectory, n).then(b, D);
        }),
        (v.getSelectedPaths = function () {
          var t = f.getSelectedItems().slice();
          return (
            t.sort(function (e, t) {
              return e - t;
            }),
            t.map(function (t) {
              return i.joinNameToCurrentDirectory(e.directoryList[t].name);
            })
          );
        }),
        (v.initiateMakeItem = function (t) {
          (e.makeItemType = t),
            d(t).then(
              function (e) {
                M(e);
              },
              function () {
                M(e.makeItemType.toLowerCase().capitalizeFirstLetter());
              }
            );
        }),
        (v.showDeleteConfirm = function (e) {
          d("DELETE_CONFIRM_MESSAGE", { item_count: e.length }).then(
            function (e) {
              O(e);
            },
            function (e) {
              O(e);
            }
          );
        }),
        (v.sortDirectoryList = function (e, t, n) {
          var o = null;
          switch (t) {
            case "name":
              o = "sortByName";
              break;
            case "modified":
              o = "sortByModificationDate";
              break;
            case "size":
              o = "sortBySize";
              break;
            case "type":
              o = "sortByType";
          }
          return null == o ? e : u[o](e, n);
        }),
        (v.downloadFileAtPath = function (e) {
          o.fetchFile(e).then(b, D);
        }),
        (v.fileRenameCallback = function (e, n) {
          if ((t.$broadcast("modal-prompt:clear-error"), n == e)) return;
          var r = U(e);
          if (null != r) return void N(r, { item_type: "item" });
          t.$broadcast("modal-prompt:set-busy", "RENAMING_ACTIVITY_STATUS");
          var a = i.joinNameToCurrentDirectory(n),
            s = i.joinNameToCurrentDirectory(e);
          o.rename(a, s).then(
            function (e) {
              t.$broadcast("modal-prompt:clear-busy"),
                responseIsUnsuccessful(e)
                  ? showResponseError(e, "RENAME_OPERATION", t, d)
                  : (v.refreshDirectoryList(),
                    t.$broadcast("items-moved", [[a, s]]),
                    t.$broadcast("modal-prompt:hide"));
            },
            function (e) {
              t.$broadcast("modal-prompt:clear-busy"),
                showResponseError(e, "RENAME_OPERATION", t, d);
            }
          ),
            (v.renameSource = null);
        }),
        (v.initiateCutOfPaths = function (e) {
          if (0 == e.length) return;
          i.setCutSource(e);
        }),
        (v.makeItemOKCallback = function (n) {
          t.$broadcast("modal-prompt:clear-error");
          var r,
            a = U(n);
          if (null != a)
            return void d(e.makeItemType).then(
              function (e) {
                N(a, { item_type: e.toLowerCase() });
              },
              function () {
                N(a, { item_type: e.makeItemType.toLowerCase() });
              }
            );
          (v.newItemPath = i.joinNameToCurrentDirectory(n)),
            t.$broadcast("modal-prompt:set-busy", "CREATING_ACTIVITY_STATUS"),
            e.makeItemType == w
              ? (r = o.makeDirectory(v.newItemPath))
              : "FILE" == e.makeItemType &&
                (r = o.putFileContents(v.newItemPath, "", null));
          r.then(
            function () {
              v.makeItemSuccessCallback();
            },
            function (t) {
              var n = e.makeItemType.toUpperCase() + "_MAKE_OPERATION",
                o = function (n) {
                  v.makeItemFailureCallback(parseErrorResponse(t, n), {
                    item_type: e.makeItemType,
                    action: n,
                  });
                };
              d(n).then(
                function (e) {
                  o(e);
                },
                function () {
                  o(n);
                }
              );
            }
          );
        }),
        (v.handleReorderChange = function (e) {
          (v.sortReversed = e == v.sortName && !v.sortReversed),
            (v.sortName = e),
            v.doReorder();
        }),
        (v.initiateCopyOfPaths = function (e) {
          if (0 == e.length) return;
          i.setCopySource(e);
        }),
        (v.directoryListSuccess = function (n, o, r) {
          (e.directoryList = v.sortDirectoryList(
            o.data.data,
            v.sortName,
            v.sortReversed
          )),
            (i.currentDirectoryList = e.directoryList),
            (i.currentDirectory = n),
            f.clearSelection(),
            r &&
              (e.isHistoryChangeDir || s.addEntry(i.currentDirectory),
              (e.isHistoryChangeDir = !1),
              t.$broadcast("directory-changed", n),
              (a.initialDirectory = n),
              a.saveSettings());
          c(function () {
            v.setupContextMenuEvents();
          });
        }),
        (v.refreshDirectoryList = function () {
          v.changeDirectory(i.currentDirectory);
        }),
        (v.downloadSelectedFiles = function () {
          var t = f.getSelectedItems();
          t.length > 1 || e.directoryList[t[0]].isDirectory
            ? v.downloadMultiple()
            : v.downloadSingle();
        }),
        (v.handleChangeDirectory = function (e, t) {
          if (e == i.currentDirectory) return;
          (void 0 !== e && null != e) || (e = i.currentDirectory);
          v.changeDirectory(e, !1, t);
        }),
        (v.makeItemSuccessCallback = function () {
          if (
            (t.$broadcast("modal-prompt:hide"),
            v.refreshDirectoryList(),
            e.makeItemType == w)
          )
            return void x();
          p.getApplicationSettings().then(
            function () {
              if (
                p.getConfigurationItem("editNewFilesImmediately") &&
                v.itemIsEditable(!1, v.newItemPath)
              ) {
                var e = v.newItemPath.split("/");
                t.$broadcast(
                  "file-editor:edit",
                  e[e.length - 1],
                  v.newItemPath
                );
              }
              x();
            },
            function (e) {
              x(), showResponseError(e, "RENAME_OPERATION", t, d);
            }
          );
        }),
        (v.makeItemFailureCallback = function (e, n) {
          t.$broadcast("modal-prompt:clear-busy"),
            d(["NEW_ITEM_FAILURE_PRECEDING_MESSAGE", e], n).then(function (t) {
              q(t.NEW_ITEM_FAILURE_PRECEDING_MESSAGE + " " + t[e]);
            });
        }),
        (v.setupContextMenuEvents = function () {
          l(".context-catcher-tr").contextmenu(function (e) {
            var t = l(this),
              n = t.find(".dropdown-menu").first(),
              o = t.data("index");
            return (
              (T = -1 != f.getSelectedItems().indexOf(o)),
              n.css(P(e)),
              l(this).find(".context-catcher-button").dropdown("toggle"),
              n.css("opacity", 0),
              setTimeout(
                function () {
                  F(e, n);
                },
                _ ? 100 : 1
              ),
              (_ = !1),
              -1 == ["DIV", "TR", "TD"].indexOf(e.target.tagName) &&
                f.selectItem(o),
              !1
            );
          });
          var t = l(".file-toolbar");
          l(".context-catcher-button").click(function () {
            var t = $(this).parent().parent().parent().data("index");
            f.selectItem(t), e.$apply();
          }),
            t.on("shown.bs.dropdown", function () {
              var e = l(this).find(".dropdown-menu");
              S = e;
              var t = e.parent().removeClass("dropup");
              "fixed" != e.css("position") &&
                e.offset().top + e.outerHeight() >
                  l(window).height() - l("#footer").height() &&
                t.addClass("dropup");
            }),
            t.on("hidden.bs.dropdown", function () {
              l(this).find(".dropdown-menu").attr("style", null), (S = null);
            });
        }),
        (v.initiateCutOfSelectedPaths = function () {
          v.initiateCutOfPaths(v.getSelectedPaths());
        }),
        (v.initiateCopyOfSelectedPaths = function () {
          v.initiateCopyOfPaths(v.getSelectedPaths());
        }),
        (v.initiateChmodOfSelectedItems = function () {
          if (0 == e.selectedItems.length) return;
          var n = [],
            o = -1;
          e.selectedItems.map(function (t) {
            var r = e.directoryList[t];
            n.push(i.joinNameToCurrentDirectory(r.name)),
              -1 == o
                ? (o = r.numericPermissions)
                : r.numericPermissions != o && (o = 0);
          }),
            t.$broadcast("modal-permissions:show", n, o);
        }),
        (v.initiateDeleteOfSelectedPaths = function () {
          var t = f.getSelectedItems();
          if (0 === t.length) return;
          var n = [];
          (e.directoriesToDelete = []), (e.filesToDelete = []);
          for (var o = 0; o < t.length; ++o) {
            var r = t[o],
              a = e.directoryList[r];
            n.push(a.name);
            var s = i.joinNameToCurrentDirectory(a.name);
            a.isDirectory
              ? e.directoriesToDelete.push(s)
              : e.filesToDelete.push(s);
          }
          h.getApplicationSetting("disableDeleteConfirmation")
            ? v.confirmDelete()
            : v.showDeleteConfirm(n);
        }),
        (v.initiateChmodOfItem = function (e) {
          var n = [i.joinNameToCurrentDirectory(e.name)];
          t.$broadcast("modal-permissions:show", n, e.numericPermissions);
        }),
        (v.copyItemName = function (e) {
          var t = document.createElement("textarea");
          (t.value = e),
            document.body.appendChild(t),
            t.select(),
            document.execCommand("copy"),
            document.body.removeChild(t);
        }),
        (v.createZip = function () {
          (v.createZipSource = f.getSelectedItems()), v.zipSelectedFiles();
        }),
        (v.initiateCreateZip = V),
        (v.createZipCallback = function (e, n) {
          if ((t.$broadcast("modal-prompt:clear-error"), "" == e)) return;
          var r = e.indexOf(".zip");
          (-1 != r && r != r.length - 5) || (e += ".zip");
          t.$broadcast("modal-prompt:set-busy", "ZIPPING_ACTIVITY_STATUS"),
            o.createZip(i.currentDirectory, v.createZipSource, e).then(
              function (e) {
                t.$broadcast("modal-prompt:clear-busy"),
                  responseIsUnsuccessful(e)
                    ? showResponseError(e, "ZIP_OPERATION", t, d)
                    : (v.refreshDirectoryList(),
                      t.$broadcast("modal-prompt:hide"));
              },
              function (e) {
                t.$broadcast("modal-prompt:clear-busy"),
                  showResponseError(e, "ZIP_OPERATION", t, d);
              }
            ),
            (v.createZipName = null),
            (v.createZipSource = []);
        }),
        (v.zipSelectedFiles = function () {
          var t = f.getSelectedItems();
          if (t.length > 0 || e.directoryList[t[0]].isDirectory) {
            var o = [];
            t.map(function (t) {
              o.push(e.directoryList[t].name);
            }),
              (v.createZipSource = o),
              (v.createZipName = "mftp-"),
              (v.createZipName += n("date")(new Date(), "yyyy-mm-dd-hh-mm-ss")),
              (v.createZipName += ".zip"),
              V();
          }
        }),
        (v.rowMouseDown = function (e) {
          m.mouseDown(e);
        }),
        (v.rowMouseMove = function (e, t) {
          m.mouseMove(e, t);
        }),
        (v.rowMouseUp = function (e) {
          m.mouseUp(e, T), (T = !1);
        }),
        (v.rowMouseLeave = function (e) {
          m.mouseLeave(e);
        }),
        (v.setEditableExtensions = function (e) {
          var t = e.split(",");
          A = [];
          for (var n = 0; n < t.length; ++n) {
            var o = t[n].trim().toLowerCase();
            if ("*" == o) return void (A = []);
            "" != o && A.push(o);
          }
        }),
        (v.itemIsEditable = function (e, t) {
          if (e) return !1;
          if (0 === A.length) return !0;
          var n = t.split("/"),
            o = extractFileExtension(n[n.length - 1]);
          return "" === o || -1 !== A.indexOf(o);
        }),
        (v.navigateUpOneLevel = function () {
          v.changeDirectory(parentPath(i.currentDirectory), !1);
        }),
        (v.showProperties = function (e) {
          t.$broadcast("modal-properties:show", e);
        }),
        (v.handleBodyClick = function (t) {
          if (3 == t.which && "files" == t.target.id) {
            (e.hasPasteSource = null != i.cutSource || null != i.copySource),
              S && S.dropdown("toggle"),
              l("#extras-dropdown-button").dropdown("toggle");
            var n = l("#extras-dropdown");
            return n.css(P(t)), F(t, n), !1;
          }
        }),
        (v.getPasteName = j),
        (v.contextMenuItemHidden = function (e) {
          return objectKeyIsFalse(v.contextMenuItemDisplay, e);
        }),
        (v.shouldHideContextMenu = function () {
          null === C &&
            (C = allInterfaceOptionsDisabled(R, v.contextMenuItemDisplay));
          return C;
        }),
        (v.browserColumnHidden = function (e) {
          return objectKeyIsFalse(v.browserColumnDisplay, e);
        }),
        (v.initiateArchiveExtract = function (e) {
          if (!v.archiveUploadAllowed) return;
          var n = i.joinNameToCurrentDirectory(e.name);
          o.downloadForExtract(n).then(
            function (t) {
              y.addExtract(e.name, t.data.data.fileKey, t.data.data.fileCount);
            },
            function (e) {
              showResponseError(e, "DOWNLOAD_FOR_EXTRACT_OPERATION", t, d);
            }
          );
        }),
        (v.isArchiveFilename = isArchiveFilename),
        (v.initiateCreateZip = V),
        (e.editItem = function (e) {
          if (g.isLicensed()) {
            var n = i.joinNameToCurrentDirectory(e.name);
            t.$broadcast("file-editor:edit", e.name, n);
          } else t.$broadcast("upgrade-required-modal:display");
        }),
        (e.initiateRenameOfItem = function (e) {
          (v.renameSource = e.name), v.initiateRename();
        }),
        e.$on("change-directory:on-history", function (t, n) {
          (e.isHistoryChangeDir = !0), v.handleChangeDirectory(n);
        }),
        e.$on("change-directory", function (t, n) {
          (e.isHistoryChangeDir = !1), v.handleChangeDirectory(n);
        }),
        e.$on("change-directory:on-upload", function () {
          v.handleChangeDirectory(null, !0);
        }),
        e.$on("server-capability:key-changed", function (e, t, n) {
          "changePermissions" == t && (v.enableChmod = v.enableChmod && n);
        }),
        (e.handleClick = function (e, t) {
          if (!(e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.stopPropagation();
            var n = this.item;
            if (n.isDirectory) {
              var o = i.joinNameToCurrentDirectory(n.name);
              v.changeDirectory(o);
            } else
              l(e.target.parentNode.parentNode)
                .find(".context-catcher-button")
                .dropdown("toggle"),
                f.selectItem(t);
          }
        }),
        e.$on("footer-button-click", function (e, t) {
          switch (t) {
            case "download":
              v.downloadSelectedFiles();
              break;
            case "cut":
              v.initiateCutOfSelectedPaths();
              break;
            case "copy":
              v.initiateCopyOfSelectedPaths();
              break;
            case "paste":
              v.performPaste();
              break;
            case "delete":
              v.initiateDeleteOfSelectedPaths();
              break;
            case "new-folder":
              v.initiateMakeItem("FOLDER");
              break;
            case "new-file":
              v.initiateMakeItem("FILE");
              break;
            case "chmod":
              v.initiateChmodOfSelectedItems();
          }
        }),
        e.$on("license-loaded", function () {
          h.getSystemConfiguration().then(k, G);
        }),
        e.$on("login", function () {
          (E = !0), I();
        }),
        e.$on("selected-items-changed", function () {
          e.selectedItems = f.getSelectedItems();
        }),
        e.$on("logout", function () {
          v.didLogout();
        }),
        e.$on("configuration:key-changed", function (e, t, n) {
          "editableFileExtensions" == t && v.setEditableExtensions(n);
        }),
        (e.initiateCreateZipOfItems = function (e) {
          v.zipSelectedFiles();
        });
    }
    angular.module("MonstaFTP").controller("FileBrowserController", e),
      (e.$inject = [
        "$scope",
        "$rootScope",
        "$filter",
        "connectionFactory",
        "uiOperationFactory",
        "$window",
        "authenticationFactory",
        "historyFactory",
        "jQuery",
        "$timeout",
        "directorySortingFactory",
        "$translate",
        "selectedItemsFactory",
        "configurationFactory",
        "localConfigurationFactory",
        "rowMouseTrackerFactory",
        "licenseFactory",
        "uploadFactory",
      ]);
  })(),
  angular.module("MonstaFTP").directive("monstaReorder", function () {
    return {
      replace: !0,
      scope: { sortIdentifier: "&", sortName: "&", vm: "=" },
      template:
        '<span ng-click="vm.handleReorderChange(sortIdentifier)" data-sort-dir="">{{ sortName|translate }}<i ng-show="vm.sortName == sortIdentifier" class="fa" ng-class="{\'fa-caret-up\': !vm.sortReversed, \'fa-caret-down\': vm.sortReversed}" aria-hidden="true"></i></span>',
      restrict: "E",
      link: function (e, t, n) {
        (e.sortName = n.sortName), (e.sortIdentifier = n.sortIdentifier);
      },
    };
  }),
  angular.module("MonstaFTP").directive("monstaReorderMobile", function () {
    return {
      replace: !0,
      scope: { sortIdentifier: "&", sortName: "&", vm: "=" },
      template:
        '<li><a href="#" ng-click="vm.handleReorderChange(sortIdentifier)" data-sort-dir="" translate>{{ sortName }}</a></li>',
      restrict: "E",
      link: function (e, t, n) {
        (e.sortName = n.sortName), (e.sortIdentifier = n.sortIdentifier);
      },
    };
  }),
  (function () {
    function e(e) {
      var t,
        n = {},
        o = !1,
        i = !1,
        r = ["DIV", "TR", "TD", "SPAN"],
        a = null,
        s = !1;
      return (
        (n.mouseDown = function (e) {
          (o = !0), (t = e), (i = !1);
        }),
        (n.mouseUp = function (e, r) {
          !o || i || r || n.mouseClick(t, e);
          (o = !1), (a = null);
        }),
        (n.mouseMove = function (e, t) {
          if (o) {
            if (((i = !0), a == t)) return;
            null == a ? n.startDrag(e, t) : n.mouseDrag(t), (a = t);
          }
        }),
        (n.mouseLeave = function (e) {
          if (-1 != r.indexOf(e.target.tagName)) return !0;
          a = null;
        }),
        (n.mouseClick = function (t, n) {
          if (-1 == r.indexOf(t.target.tagName)) return !0;
          t.preventDefault(),
            t.ctrlKey || t.metaKey
              ? e.metaClickAtIndex(n)
              : t.shiftKey
              ? e.shiftClickAtIndex(n)
              : "SPAN" != t.target.tagName && e.standardClickAtIndex(n);
        }),
        (n.mouseDrag = function (t) {
          s ? e.metaDraggedToIndex(t) : e.draggedToIndex(t);
        }),
        (n.startDrag = function (t, n) {
          t.metaKey || t.ctrlKey
            ? ((s = !0), e.startMetaDraggingAtIndex(n))
            : ((s = !1), e.startDraggingAtIndex(n));
        }),
        n
      );
    }
    angular.module("MonstaFTP").factory("rowMouseTrackerFactory", e),
      (e.$inject = ["selectedItemsFactory"]);
  })(),
  (function () {
    function e(e) {
      var t,
        n = [],
        o = 0,
        i = 0,
        r = 0;
      function a(e, t) {
        if (e == t) return [e];
        var n = 1;
        e > t && (n = -1);
        var o = [e];
        do {
          (e += n), o.push(e);
        } while (e != t);
        return o;
      }
      function s() {
        (n = []), l();
      }
      function l() {
        e.$broadcast("selected-items-changed");
      }
      return {
        getSelectedItems: function () {
          return n;
        },
        standardClickAtIndex: function (e) {
          if (1 == n.length && n[0] == e) return (n = []), void l();
          (-1 == n.indexOf(e) || n.length > 1) && ((n = [e]), (o = e), l());
        },
        shiftClickAtIndex: function (e) {
          (1 == n.length && -1 != n.indexOf(e)) || ((n = a(o, e)), l());
        },
        metaClickAtIndex: function (e) {
          var t = n.indexOf(e);
          -1 == t ? n.push(e) : n.splice(t, 1);
          l();
        },
        clearSelection: s,
        startDraggingAtIndex: function (e) {
          s(), (i = e), (n = [e]), l();
        },
        draggedToIndex: function (e) {
          (n = a(i, e)), l();
        },
        startMetaDraggingAtIndex: function (e) {
          (r = e), (t = angular.copy(n));
        },
        metaDraggedToIndex: function (e) {
          for (
            var o = angular.copy(t), i = Math.min(e, r), a = Math.max(e, r);
            i <= a;
            ++i
          ) {
            -1 == t.indexOf(i) ? o.push(i) : o.splice(o.indexOf(i), 1);
          }
          (n = o), l();
        },
        selectItem: function (e) {
          (n = [e]), l();
        },
      };
    }
    angular.module("MonstaFTP").factory("selectedItemsFactory", e),
      (e.$inject = ["$rootScope"]);
  })(),
  angular.module("MonstaFTP").factory("directorySortingFactory", function () {
    var e = function (e, t) {
        return e.isDirectory == t.isDirectory ? 0 : e.isDirectory ? -1 : 1;
      },
      t = function (t, n) {
        var o = e(t, n);
        return 0 != o
          ? o
          : t.name.toLowerCase() == n.name.toLowerCase()
          ? 0
          : t.name.toLowerCase() > n.name.toLowerCase()
          ? 1
          : -1;
      },
      n = function (n, o) {
        var i = e(n, o);
        return 0 != i
          ? i
          : n.modificationDate != o.modificationDate
          ? n.modificationDate - o.modificationDate
          : t(n, o);
      },
      o = function (n, o) {
        var i = e(n, o);
        return 0 != i ? i : n.size != o.size ? n.size - o.size : t(n, o);
      },
      i = function (n, o) {
        var i = e(n, o);
        if (0 != i) return i;
        var r = extractFileExtension(n.name),
          a = extractFileExtension(o.name);
        return r != a ? (r > a ? 1 : -1) : t(n, o);
      };
    return {
      _handleReverse: function (e, t) {
        return t && e.reverse(), e;
      },
      sortByName: function (e, n) {
        return this._handleReverse(e.sort(t), n);
      },
      sortByModificationDate: function (e, t) {
        return this._handleReverse(e.sort(n), t);
      },
      sortBySize: function (e, t) {
        return this._handleReverse(e.sort(o), t);
      },
      sortByType: function (e, t) {
        return this._handleReverse(e.sort(i), t);
      },
    };
  }),
  (function () {
    function e(e, t, n, o, i, r) {
      "use strict";
      var a = this,
        s = t("html"),
        l = o.isLicensed(),
        c = !0,
        u = !0,
        d = !0;
      function f(e, t, n) {
        for (var o = 0; o < e.length; ++o) {
          if (n(e[o])) {
            if (!t) return !0;
          } else if (t) return !1;
        }
        return t;
      }
      function h(e, t) {
        return f(e, !1, function (e) {
          return !0 === e.webkitGetAsEntry()[t];
        });
      }
      (a.handleDropEvent = function (t) {
        t.preventDefault();
        var n = !1,
          o = t.dataTransfer.items,
          i = !1 === l || !1 === d,
          a = null;
        if (null != o) {
          if (
            !1 === u &&
            (function (e) {
              return h(e, "isDirectory");
            })(o)
          )
            return void r.$broadcast(
              "modal-error:show",
              "FOLDER_UPLOAD_DISABLED"
            );
          if (
            !1 === c &&
            (function (e) {
              return h(e, "isFile");
            })(o) &&
            ((n = !0),
            !1 !== d &&
              (function (e) {
                return f(e, !0, function (e) {
                  return isArchiveFilename(e.webkitGetAsEntry().name);
                });
              })(o) &&
              ((n = !1), (a = !0)),
            n)
          )
            return void r.$broadcast(
              "modal-error:show",
              "FILE_UPLOAD_DISABLED"
            );
          e.handleItemsBasedUpload(o, !i && a);
        } else {
          var s = t.dataTransfer.files;
          if (
            (!1 === c &&
              ((n = !0),
              !1 !== d &&
                (function (e) {
                  return f(e, !0, function (e) {
                    return isArchiveFilename(e.name);
                  });
                })(s) &&
                ((n = !1), (a = !0))),
            n)
          )
            return void r.$broadcast(
              "modal-error:show",
              "FILE_UPLOAD_DISABLED"
            );
          e.handleFilesBasedUpload(s, !i && a);
        }
      }),
        n.$on("license-loaded", function () {
          (l = o.isLicensed()),
            i.getSystemConfiguration().then(
              function () {
                if (o.isLicensed()) {
                  l = !0;
                  var e = normalizeFooterDisplayOptions(
                    i.getApplicationSetting("footerItemDisplay") || {}
                  );
                  (c = !1 !== e["upload-file"]),
                    (u = !1 !== e["upload-folder"]),
                    (d = !1 !== e["upload-archive"]);
                } else l = !1;
              },
              function (e) {}
            );
        }),
        s.ready(function () {
          var e = t("#file-xfer-drop");
          s.on("dragenter", function () {
            (c || u || d) &&
              (e.css({ top: 0, height: $(window).height(), display: "table" }),
              e.show());
          }),
            s.on("dragend", function () {
              (c || u || d) && e.hide();
            }),
            e.ready(function () {
              e.on({
                dragenter: function (e) {
                  (c || u || d) && (e.stopPropagation(), e.preventDefault());
                },
                dragleave: function (t) {
                  (c || u || d) &&
                    (t.stopPropagation(), t.preventDefault(), e.hide());
                },
                dragover: function (e) {
                  (c || u || d) && (e.stopPropagation(), e.preventDefault());
                },
                drop: function (t) {
                  if (c || u || d) {
                    t.stopPropagation(), t.preventDefault();
                    var n = t.originalEvent;
                    if (!n.dataTransfer || !n.dataTransfer.files) return !1;
                    if (
                      !(function (e) {
                        if (e.dataTransfer.types) {
                          for (var t = 0; t < e.dataTransfer.types.length; t++)
                            if ("Files" == e.dataTransfer.types[t]) return !0;
                          return !1;
                        }
                      })(n)
                    )
                      return !1;
                    a.handleDropEvent(n), e.hide();
                  }
                },
                dragend: function (t) {
                  (c || u || d) &&
                    (t.stopPropagation(), t.preventDefault(), e.hide());
                },
              });
            });
        });
    }
    angular.module("MonstaFTP").controller("DragDropController", e),
      (e.$inject = [
        "uploadUIFactory",
        "jQuery",
        "$scope",
        "licenseFactory",
        "configurationFactory",
        "$rootScope",
      ]);
  })(),
  (function () {
    function e(e) {
      return function (t) {
        if ("number" != typeof t) return "";
        var n,
          o = new Date(1e3 * t),
          i = new Date();
        return (
          (n =
            o.getDate() == i.getDate() &&
            o.getMonth() == i.getMonth() &&
            o.getFullYear() == i.getFullYear()
              ? "shortTime"
              : "mediumDate"),
          e(o, n)
        );
      };
    }
    angular.module("MonstaFTP").filter("file_last_modified", e),
      (e.$inject = ["dateFilter"]);
  })(),
  angular.module("MonstaFTP").filter("file_size", function () {
    return function (e) {
      return e < 0 && (e = 0), normalizeFileSize(e);
    };
  }),
  angular.module("MonstaFTP").filter("html_safe", [
    "$sce",
    function (e) {
      return function (t) {
        return e.trustAsHtml(t);
      };
    },
  ]),
  angular.module("MonstaFTP").filter("human_time_since", function () {
    return function (e, t) {
      if ("number" != typeof e) return "";
      var n,
        o,
        i = Date.now() / 1e3 - e,
        r = [
          [3540, 60, "minute"],
          [82800, 3600, "hour"],
          [2592e3, 86400, "day"],
        ];
      if (i < 0 || i > r[r.length - 1][0])
        return (function (e, t) {
          var n = new Date(1e3 * e);
          return !0 === t
            ? n.getDate() + "/" + (n.getMonth() + 1) + "/" + n.getFullYear()
            : n.getMonth() + 1 + "/" + n.getDate() + "/" + n.getFullYear();
        })(e, t);
      if (i <= 60) return "now";
      for (var a = 0; a < r.length; ++a)
        if (!(i > r[a][0])) {
          (n = Math.round(i / r[a][1])), (o = r[a][2]);
          break;
        }
      return 1 != n && (o += "s"), n + " " + o + " ago";
    };
  }),
  angular.module("MonstaFTP").filter("icon", function () {
    return function (e) {
      if (e.isDirectory) return "fa-folder";
      if (e.isLink) return "fa-long-arrow-right";
      var t = "";
      switch (extractFileExtension(e.name)) {
        case "doc":
        case "docx":
          t = "word";
          break;
        case "xlr":
        case "xls":
        case "xlsx":
          t = "excel";
          break;
        case "ppt":
        case "pps":
        case "pptx":
          t = "powerpoint";
          break;
        case "pdf":
          t = "pdf";
          break;
        case "txt":
        case "rtf":
        case "text":
          t = "text";
          break;
        case "bmp":
        case "gif":
        case "jpg":
        case "png":
        case "psd":
        case "tif":
        case "ai":
        case "eps":
        case "svg":
        case "ps":
        case "jpeg":
          t = "image";
          break;
        case "avi":
        case "flv":
        case "m4v":
        case "mov":
        case "mp4":
        case "mkv":
        case "mpg":
        case "wmv":
          t = "video";
          break;
        case "wav":
        case "mp3":
        case "wma":
        case "m4a":
        case "m4p":
        case "mpa":
        case "flac":
        case "aif":
        case "aiff":
          t = "audio";
          break;
        case "tar":
        case "zip":
        case "tgz":
        case "gz":
        case "gzip":
        case "rar":
          t = "archive";
          break;
        case "htm":
        case "html":
        case "php":
        case "asp":
        case "aspx":
        case "js":
        case "css":
        case "xhtml":
        case "cfm":
        case "pl":
        case "py":
        case "c":
        case "cpp":
        case "rb":
        case "java":
        case "xml":
        case "json":
          t = "code";
      }
      return "fa-file" + ("" == t ? "" : "-") + t + "-o";
    };
  }),
  angular.module("MonstaFTP").filter("item_permission_description", [
    "permissionsFactory",
    function (e) {
      return function (t) {
        var n = t.isDirectory ? "d" : "-",
          o = e.numericToObject(t.numericPermissions);
        return (
          (n += o.ownerRead ? "r" : "-"),
          (n += o.ownerWrite ? "w" : "-"),
          (n += o.ownerExecute ? "x" : "-"),
          (n += o.groupRead ? "r" : "-"),
          (n += o.groupWrite ? "w" : "-"),
          (n += o.groupExecute ? "x" : "-"),
          (n += o.otherRead ? "r" : "-"),
          (n += o.otherWrite ? "w" : "-"),
          (n += o.otherExecute ? "x" : "-")
        );
      };
    },
  ]),
  angular.module("MonstaFTP").filter("sort_description", function () {
    return function (e) {
      switch (e) {
        case "modified":
          return "CHANGED";
        default:
          return e.toUpperCase();
      }
    };
  }),
  angular.module("MonstaFTP").filter("spaces_to_nbsp", function () {
    return function (e) {
      return e.replace(/ /g, String.fromCharCode(160));
    };
  }),
  angular.module("MonstaFTP").filter("transfer_percent", function () {
    return function (e) {
      if (e.forceComplete) return 100;
      var t = null == e.request && "extract" != e.stats.transferType;
      return e.hasError || !t || e.stats.hasBeenStarted()
        ? null == e.stats
          ? 0
          : 0 != e.archiveExtractMax && -1 != e.archiveExtractCurrent
          ? (e.archiveExtractCurrent / e.archiveExtractMax) * 100
          : e.stats.getTransferPercent()
        : 0;
    };
  }),
  angular.module("MonstaFTP").filter("transfer_rate", function () {
    return function (e) {
      if (null == e.stats) return "-";
      var t = normalizeFileSize(e.stats.calculateTransferRate());
      return "" == t ? "-" : t + "/s";
    };
  }),
  (function () {
    function e(e, t, n, o, i, r, a, s) {
      "use strict";
      (e.editorFiles = []),
        (e.activeFile = null),
        (e.pathOfTabToRemove = null),
        (e.licenseFactory = i),
        (e.settings = { autoSave: !1 });
      var l,
        c = "#modal-editor",
        u = this,
        d = null,
        f = null,
        h = !1;
      function p() {
        (e.editorFiles = []), (e.activeFile = null);
      }
      function m() {
        T();
      }
      function g() {
        o(c).off("hide.bs.modal"),
          o(c).off("shown.bs.modal"),
          h && S(),
          -1 != u.savedDirectories.indexOf(a.currentDirectory) &&
            t.$broadcast("change-directory"),
          null != f && f.removeClass("open"),
          t.$broadcast("file-editor:hide", e.editorFiles.length),
          o(c).modal("hide"),
          window.removeEventListener("resize", T);
      }
      function y(t, n) {
        (e.activeFile = u.getEditorFileByPath(n)), u.setupAdvancedEditor(t, n);
      }
      function v(e) {
        t.$broadcast(
          "modal-confirm:show",
          e,
          u.confirmTabClose,
          u.cancelTabClose
        );
      }
      function E(t) {
        e.editorFiles.length <= 1 ||
          e.editorFiles.splice(0, 0, e.editorFiles.splice(t, 1)[0]);
      }
      function A(e) {
        null != f &&
          f.hasClass("open") &&
          !e.target.classList.contains("close") &&
          (f.removeClass("open"), S());
      }
      function S() {
        window.removeEventListener("click", A), (h = !1);
      }
      function T() {
        e.activeFile &&
          e.activeFile.isWidgetSetup &&
          e.activeFile.widget &&
          e.activeFile.widget.layout();
      }
      (u.savedDirectories = []),
        (u.hideProUpgradeMessages = !1),
        (u.allowEdit = !0),
        (u.show = function () {
          t.$broadcast("file-editor:will-show"),
            (u.hideProUpgradeMessages = s.getApplicationSetting(
              "hideProUpgradeMessages"
            )),
            (u.savedDirectories = []),
            o(c).on("shown.bs.modal", m),
            o(c).modal("show"),
            o(c).on("hide.bs.modal", g),
            window.addEventListener("resize", T);
        }),
        (u.hide = g),
        (u.setupAdvancedEditor = function (t, n) {
          var o = u.getEditorFileByPath(n);
          if (null == o) return;
          if (!0 === o.isWidgetSetup)
            return void (o.dirty || o.widget.setValue(o.contents));
          E(u.getFileIndexByPath(n));
          var i,
            r = "editor_ta_" + n;
          if (t.indexOf(".") > 0) {
            var a = t.split(".");
            i = "." + a[a.length - 1];
          } else i = null;
          window.setTimeout(function () {
            var t;
            require.config({ paths: { vs: "application/frontend/vs" } });
            var a = document.getElementById(r);
            require(["vs/editor/editor.main"], function () {
              var r = s.getApplicationSetting("editorOptions");
              (r.language = (function (e) {
                if (null === e) return null;
                for (
                  var t = monaco.languages.getLanguages(), n = t.length, o = 0;
                  o < n;
                  ++o
                ) {
                  var i = t[o];
                  if (-1 !== i.extensions.indexOf(e)) return i.id;
                }
                return null;
              })(i)),
                (r.readOnly = !u.allowEdit),
                (t = monaco.editor.create(
                  document.getElementById("editor_display_" + n),
                  r
                )).setValue(a.value),
                (o.isWidgetSetup = !0),
                (o.widget = t),
                t.onDidChangeModelContent(function () {
                  e.textChange(o.path);
                });
            });
          }, 100);
        }),
        (u.startEditingFile = function (e, t) {
          if (!i.isLicensed()) return;
          u.ensureFileInScope(e, t, !0, function () {
            y(e, t);
          });
        }),
        (u.ensureFileInScope = function (t, n, o, r) {
          if (u.filePathIsInScope(n)) {
            return u.getEditorFileByPath(n).dirty || !o
              ? (r && r(), !0)
              : (u.loadFileContents(n, r), !1);
          }
          var a = {
            name: t,
            path: n,
            contents: null,
            originalContents: null,
            dirty: !1,
            saving: !1,
            isWidgetSetup: !1,
            widget: null,
            cm: null,
          };
          i.isLicensed() ? e.editorFiles.push(a) : (e.editorFiles = [a]);
          return u.loadFileContents(n, r), !1;
        }),
        (u.getFileIndexByPath = function (t) {
          for (var n = 0; n < e.editorFiles.length; ++n)
            if (e.editorFiles[n].path == t) return n;
          return -1;
        }),
        (u.filePathIsInScope = function (e) {
          return -1 !== u.getFileIndexByPath(e);
        }),
        (u.getEditorFileByPath = function (t) {
          var n = u.getFileIndexByPath(t);
          return -1 === n ? null : e.editorFiles[n];
        }),
        (u.updateFileContents = function (e, t) {
          var n = u.getEditorFileByPath(e);
          if (null == n) return;
          (n.contents = t),
            (n.originalContents = t),
            null != n.widget &&
              window.setTimeout(function () {
                n.widget.setValue(t);
              }, 100);
        }),
        (u.loadFileContents = function (e, o) {
          if (null == u.getEditorFileByPath(e)) return;
          n.getFileContents(e).then(
            function (t) {
              u.updateFileContents(e, b64DecodeUnicode(t.data.data)), o && o();
            },
            function (e) {
              showResponseError(e, "FILE_LOAD_OPERATION", t, r);
            }
          );
        }),
        (u.removeFile = function (t) {
          var n = u.getFileIndexByPath(t);
          if (-1 === n) return;
          var o = e.editorFiles.splice(n, 1);
          o.length && o[0].widget && (o[0].widget = null);
          if (0 === e.editorFiles.length)
            return (e.activeFile = null), void u.hide();
          var i = Math.min(n, e.editorFiles.length - 1);
          e.activeFile = e.editorFiles[i];
        }),
        (u.initiateConfirmTabClose = function (t, n) {
          (e.pathOfTabToRemove = n),
            r("EDITOR_CLOSE_CONFIRM_MESSAGE", { file_name: t }).then(v, v);
        }),
        (u.confirmTabClose = function () {
          u.removeFile(e.pathOfTabToRemove), (e.pathOfTabToRemove = null);
        }),
        (u.cancelTabClose = function () {
          e.pathOfTabToRemove = null;
        }),
        (u.contentPutFinish = function (t, n) {
          var o = u.getFileIndexByPath(t);
          if (-1 === o) return;
          var i = e.editorFiles[o];
          if (null === i) return;
          if (((i.saving = !1), n)) {
            (i.dirty = !1), (i.originalContents = i.contents);
            var r = t.replace(/\\/g, "/").replace(/\/[^\/]*\/?$/, "");
            "" === r && (r = "/"),
              -1 === u.savedDirectories.indexOf(r) &&
                u.savedDirectories.push(r),
              E(o);
          }
          window.setTimeout(function () {
            e.$apply();
          }, 100);
        }),
        (u.beginAutoSave = function () {
          d && window.clearTimeout(d);
          if (!e.settings.autoSave || !u.allowEdit) return;
          d = window.setTimeout(function () {
            (d = null), e.saveActiveFile(!0, !1);
          }, AUTOSAVE_DELAY_MS);
        }),
        (u.fileListClick = function (e) {
          null == f &&
            ((f = o(e.target).parent()),
            "I" == e.target.tagName && (f = f.parent()));
          return (
            (l = !f.hasClass("open")),
            e.preventDefault(),
            f.toggleClass("open"),
            window.setTimeout(function () {
              l ? (window.addEventListener("click", A), (h = !0)) : S();
            }, 0),
            !1
          );
        }),
        (u.shouldShowProUpgrade = function () {
          return !0 !== u.hideProUpgradeMessages && !i.isLicensed();
        }),
        (u.itemsMoved = function (t) {
          for (var n = [], o = 0; o < t.length; ++o) {
            var i = t[o];
            if (0 != i.length)
              for (
                var r = "/" == i.substr(i.length - 1) ? i : i + "/", a = 0;
                a < e.editorFiles.length;
                ++a
              ) {
                var s = e.editorFiles[a];
                if (i == s.path) n.push(s.path);
                else {
                  if (s.path.length <= r.length) continue;
                  s.path.substr(0, r.length) == r && n.push(s.path);
                }
              }
          }
          for (var l = 0; l < n.length; ++l) u.removeFile(n[l], !0);
        }),
        (e.activateTab = function (t, n) {
          "BUTTON" != n.target.tagName &&
            ((e.activeFile = u.getEditorFileByPath(t)),
            E(u.getFileIndexByPath(t)),
            null != f && f.removeClass("open"),
            h && S(),
            window.setTimeout(function () {
              e.activeFile.isWidgetSetup &&
                e.activeFile.widget &&
                e.activeFile.widget.layout();
            }, 100));
        }),
        (e.closeTabForFile = function (e, t) {
          return u.getEditorFileByPath(t).dirty
            ? (u.initiateConfirmTabClose(e, t), !1)
            : (u.removeFile(t), !1);
        }),
        (e.textChange = function (t) {
          var n = u.getEditorFileByPath(t);
          if (null != n) {
            var o = n.dirty;
            (n.dirty = n.contents !== n.widget.getValue()),
              n.dirty !== o &&
                window.setTimeout(function () {
                  e.$apply();
                }),
              u.beginAutoSave.call(u);
          }
        }),
        (e.saveActiveFile = function (o, i) {
          if (null != e.activeFile && e.activeFile.dirty) {
            (e.activeFile.saving = !0),
              (e.activeFile.contents = e.activeFile.widget.getValue());
            var a = e.activeFile.path,
              l = s.getApplicationSetting("encodeEditorSaves");
            n.putFileContents(
              a,
              e.activeFile.contents,
              e.activeFile.originalContents,
              o,
              l,
              i
            ).then(
              function () {
                u.contentPutFinish(a, !0);
              },
              function (n) {
                !(function (e) {
                  if (void 0 === e.data || null === e.data) return !1;
                  if (void 0 === e.data.localizedErrors) return !1;
                  for (var t = 0; t < e.data.localizedErrors.length; ++t)
                    if (
                      "FILE_CHANGED_ON_SERVER" ===
                      e.data.localizedErrors[t].errorName
                    )
                      return !0;
                  return !1;
                })(n)
                  ? (u.contentPutFinish(a, !1),
                    showResponseError(n, "FILE_SAVE_OPERATION", t, r))
                  : t.$broadcast(
                      "modal-choice:show",
                      "FILE_CHANGED_CONFIRM_TITLE",
                      "FILE_CHANGE_CONFIRM_MESSAGE",
                      function () {
                        u.contentPutFinish(e.activeFile.path, !1);
                      },
                      [
                        [
                          "FILE_CHANGED_OVERWRITE",
                          function () {
                            e.saveActiveFile(!1, !0);
                          },
                        ],
                        [
                          "FILE_CHANGED_LOAD",
                          function () {
                            u.loadFileContents(e.activeFile.path, function () {
                              y(e.activeFile.name, e.activeFile.path),
                                u.contentPutFinish(e.activeFile.path, !0);
                            });
                          },
                        ],
                      ]
                    );
              }
            );
          }
        }),
        e.$on("file-editor:edit", function (e, t, n) {
          i.isLicensed() &&
            (u.allowEdit = !s.getApplicationSetting("disableFileEdit")),
            u.startEditingFile(t, n),
            u.show();
        }),
        e.$on("file-editor:show", function () {
          u.show();
        }),
        e.$on("logout", function () {
          p();
        }),
        e.$on("login", function () {
          p();
        }),
        e.$on("items-deleted", function (e, t) {
          u.itemsMoved(t);
        }),
        e.$on("items-moved", function (e, t) {
          for (var n = [], o = 0; o < t.length; ++o) n.push(t[o][0]);
          u.itemsMoved(n);
        });
    }
    angular.module("MonstaFTP").controller("FileEditorController", e),
      (e.$inject = [
        "$scope",
        "$rootScope",
        "connectionFactory",
        "jQuery",
        "licenseFactory",
        "$translate",
        "uiOperationFactory",
        "configurationFactory",
      ]);
  })(),
  (function () {
    function e(e, t, n, o, i) {
      var r = this,
        a = ["forward", "back", "refresh"];
      function s() {
        (r.canGoBack = n.hasPreviousHistoryItem()),
          (r.canGoForward = n.hasNextHistoryItem());
      }
      (r.canGoBack = !1),
        (r.canGoForward = !1),
        (r.itemDisplay = {}),
        (r.navigateBack = function () {
          if (!r.canGoBack) return;
          var e = n.navigateBack();
          e && t.$broadcast("change-directory:on-history", e);
        }),
        (r.navigateForward = function () {
          if (!r.canGoForward) return;
          var e = n.navigateForward();
          e && t.$broadcast("change-directory:on-history", e);
        }),
        (r.refresh = function () {
          t.$broadcast("change-directory");
        }),
        (r.itemHidden = function (e) {
          return !!r.itemDisplay.hasOwnProperty(e) && !1 === r.itemDisplay[e];
        }),
        e.$on("history-changed", function () {
          s();
        }),
        e.$on("directory-changed", function () {
          s();
        }),
        e.$on("license-loaded", function () {
          o.isLicensed() &&
            i.getSystemConfiguration().then(
              function () {
                (r.itemDisplay =
                  i.getApplicationSetting("headerItemDisplay") || {}),
                  (function () {
                    if (allInterfaceOptionsDisabled(a, r.itemDisplay)) {
                      document
                        .getElementsByTagName("body")[0]
                        .classList.add("no-header");
                    }
                  })();
              },
              function () {}
            );
        });
    }
    angular.module("MonstaFTP").controller("HeaderController", e),
      (e.$inject = [
        "$scope",
        "$rootScope",
        "historyFactory",
        "licenseFactory",
        "configurationFactory",
      ]);
  })(),
  (function () {
    function e(e, t, n, o, i, r, a, s, l, c) {
      var u = this,
        d = ["chmod", "cut", "copy", "download"],
        f = null,
        h = [
          "chmod",
          "cut",
          "copy",
          "paste",
          "delete",
          "fetch-file",
          "upload",
          "upload-file",
          "upload-folder",
          "upload-archive",
          "download",
          "new-item",
          "new-file",
          "new-folder",
          "show-editor",
          "session-information",
          "remote-server",
          "username",
          "upload-limit",
          "version",
          "new-version-alert",
        ],
        p = 0;
      (u.isArchiveUpload = !1),
        (e.selectedItemsCount = 0),
        (e.hasPasteSource = !1),
        (e.maxUploadBytes = MAX_UPLOAD_BYTES),
        (e.currentUsername = null),
        (e.currentHost = null),
        (e.currentVersion = 0),
        (e.newVersionAvailable = !1),
        (e.editorActive = !1),
        (u.enableChmod = !0),
        (u.enableFileView = c.isLicensed()),
        (u.enableFileEdit = !0),
        (u.showRemoteServerAddress = !0),
        (u.isLicensed = !1),
        (u.isLoggedIn = !1),
        (u.itemDisplay = {}),
        (u.sessionDisplayForce = !1),
        (u.handleUpload = function () {
          (m.value = null), m.click();
        }),
        (u.handleUploadFolder = function () {
          if (
            !(function () {
              if (null === f) {
                var e = document.createElement("input");
                f =
                  "webkitdirectory" in e ||
                  "mozdirectory" in e ||
                  "odirectory" in e ||
                  "msdirectory" in e ||
                  "directory" in e;
              }
              return f;
            })()
          )
            return void a("FOLDER_UPLOAD_NOT_SUPPORTED_MESSAGE").then(E, E);
          (g.value = null), g.click();
        }),
        (u.allowAction = function (t) {
          return "show-editor" == t
            ? e.editorActive
            : "paste" == t
            ? e.hasPasteSource
            : -1 == d.indexOf(t) || 0 != e.selectedItemsCount;
        }),
        (u.performRemoteFetch = function (e) {
          a("FETCHING_ACTIVITY_STATUS").then(function (e) {
            t.$broadcast("modal-prompt:set-busy", e);
          }),
            o.fetchRemoteFile(e, n.currentDirectory).then(
              function (e) {
                responseIsUnsuccessful(e)
                  ? showResponseError(e, "REMOTE_FILE_FETCH_OPERATION", t, a)
                  : (t.$broadcast("change-directory"),
                    t.$broadcast("modal-prompt:hide"));
              },
              function (e) {
                showResponseError(e, "REMOTE_FILE_FETCH_OPERATION", t, a),
                  t.$broadcast("modal-prompt:clear-busy");
              }
            );
        }),
        (u.remoteFetchCallback = function (e) {
          if ((t.$broadcast("modal-prompt:clear-error"), !basicURLValidate(e)))
            return void a("URL_INVALID_MESSAGE").then(A, A);
          var n = e.replace(/^\s\s*/, "");
          u.performRemoteFetch.call(u, n);
        }),
        (u.initiateRemoteFetch = function () {
          a(["FETCH_FILE_PROMPT_TITLE", "FETCH_FILE_URL_PLACEHOLDER"]).then(
            function (e) {
              t.$broadcast(
                "modal-prompt:show",
                e.FETCH_FILE_PROMPT_TITLE,
                null,
                e.FETCH_FILE_URL_PLACEHOLDER,
                u.remoteFetchCallback
              );
            }
          );
        }),
        (u.onEditorHide = function (t) {
          e.editorActive = 0 != t;
        }),
        (u.showEditor = function () {
          t.$broadcast("file-editor:show");
        }),
        (u.validateArchiveUpload = S),
        (u.buttonClick = function (e) {
          if (!u.isLoggedIn) return;
          if ("upload-file" === e)
            return (u.isArchiveUpload = !1), void u.handleUpload();
          if ("upload-folder" === e)
            return (u.isArchiveUpload = !1), void u.handleUploadFolder();
          if ("upload-archive" === e)
            return void (c.isLicensed()
              ? ((u.isArchiveUpload = !0), u.handleUpload())
              : t.$broadcast("upgrade-required-modal:display"));
          if ("fetch-file" === e)
            return void (c.isLicensed()
              ? u.initiateRemoteFetch()
              : t.$broadcast("upgrade-required-modal:display"));
          if ("show-editor" === e) {
            if (!u.allowAction(e)) return;
            return void u.showEditor();
          }
          if ("new-file" === e && !c.isLicensed())
            return void t.$broadcast("upgrade-required-modal:display");
          if (!u.allowAction(e)) return;
          t.$broadcast("footer-button-click", e);
        }),
        (u.itemHidden = T),
        (u.showUpdateModal = function () {
          t.$broadcast("modal-update:show");
        });
      var m = document.getElementById("upload-placeholder"),
        g = document.getElementById("upload-folder-placeholder");
      function y() {
        e.currentVersion &&
          window.MONSTA_LATEST_VERSION &&
          (e.newVersionAvailable = versionIsLessThan(
            e.currentVersion,
            window.MONSTA_LATEST_VERSION
          ));
      }
      function v() {
        if (this.files && this.files.length) {
          var e = this.items;
          (u.isArchiveUpload && !S(this.files)) ||
            (null != e
              ? r.handleItemsBasedUpload(e, !!u.isArchiveUpload && null)
              : r.handleFilesBasedUpload(
                  this.files,
                  !!u.isArchiveUpload && null
                ));
        }
      }
      function E(e) {
        t.$broadcast("modal-error:show", e);
      }
      function A(e) {
        t.$broadcast("modal-prompt:set-error", e);
      }
      function S(e) {
        var n = null;
        return (
          1 !== e.length
            ? (n = "MULTIPLE_FILE_ARCHIVE_ERROR")
            : isArchiveFilename(e[0].name) ||
              (n = "INVALID_TYPE_ARCHIVE_ERROR"),
          null == n || (t.$broadcast("modal-error:show", n), !1)
        );
      }
      function T(e) {
        return !!u.itemDisplay.hasOwnProperty(e) && !1 === u.itemDisplay[e];
      }
      m && (m.addEventListener("change", v), g.addEventListener("change", v)),
        e.$on("selected-items-changed", function () {
          e.selectedItemsCount = s.getSelectedItems().length;
        }),
        e.$on("paste-source:set", function () {
          e.hasPasteSource = !0;
        }),
        e.$on("paste-source:cleared", function () {
          e.hasPasteSource = !1;
        }),
        e.$on("license-loaded", function () {
          (u.isLicensed = c.isLicensed()),
            l.getSystemConfiguration().then(
              function () {
                u.isLicensed &&
                  ((u.enableChmod =
                    u.enableChmod && !l.getApplicationSetting("disableChmod")),
                  (u.enableFileView =
                    !l.getApplicationSetting("disableFileView")),
                  (u.enableFileEdit =
                    u.enableFileView &&
                    !l.getApplicationSetting("disableFileEdit")),
                  (u.showRemoteServerAddress = !l.getApplicationSetting(
                    "disableRemoteServerAddressDisplay"
                  )),
                  (u.itemDisplay = normalizeFooterDisplayOptions(
                    l.getApplicationSetting("footerItemDisplay") || {}
                  )),
                  (p = l.getApplicationSetting(
                    "resumeSessionInfoDisplaySeconds"
                  )),
                  (function () {
                    if (allInterfaceOptionsDisabled(h, u.itemDisplay)) {
                      document
                        .getElementsByTagName("body")[0]
                        .classList.add("no-footer");
                    }
                  })());
              },
              function (e) {}
            );
        }),
        e.$on("login", function (t, n) {
          var o = i.getActiveConfiguration(),
            r = null;
          o.username
            ? (r = o.username)
            : o.remoteUsername && (r = o.remoteUsername),
            (e.currentUsername = r),
            (e.currentHost = o.host || null),
            (e.editorActive = !1),
            (u.isLoggedIn = !0),
            "resume" === n &&
              (T("session-information") ||
                p <= 0 ||
                ((u.sessionDisplayForce = !0),
                window.setTimeout(function () {
                  (u.sessionDisplayForce = !1), e.$apply();
                }, 1e3 * p)));
        }),
        e.$on("logout", function () {
          (e.currentUsername = null),
            (e.currentHost = null),
            (e.editorActive = !1),
            (u.isLoggedIn = !1);
        }),
        e.$on("file-editor:hide", function (e, t) {
          u.onEditorHide(t);
        }),
        e.$on("server-capability:key-changed", function (e, t, n) {
          "changePermissions" === t && (u.enableChmod = u.enableChmod && n);
        }),
        document.addEventListener("latestVersionLoadEVent", function () {
          y();
        }),
        l.getSystemConfiguration().then(
          function (t) {
            (MAX_UPLOAD_BYTES = t.maxFileUpload),
              (e.maxUploadBytes = MAX_UPLOAD_BYTES),
              (e.currentVersion = t.version),
              y();
          },
          function (e) {}
        );
    }
    angular.module("MonstaFTP").controller("FooterController", e),
      (e.$inject = [
        "$scope",
        "$rootScope",
        "uiOperationFactory",
        "connectionFactory",
        "authenticationFactory",
        "uploadUIFactory",
        "$translate",
        "selectedItemsFactory",
        "configurationFactory",
        "licenseFactory",
      ]);
  })(),
  (function () {
    function e(e) {
      return {
        replace: !0,
        scope: {
          iconClass: "&",
          itemTitle: "&",
          activeCondition: "<?",
          disabledCondition: "<?",
          identifier: "&",
          vm: "=",
          hideCondition: "<?",
        },
        template:
          '<button class="fa fa-fw {{ iconClass }} {{ (activeCondition && vm.isLoggedIn) ? \'active\' : \'inactive\' }}" title="{{ buttonTitle|translate }}" ng-click="vm.buttonClick(buttonIdentifier)" ng-class="{\'disabled-link\': disabledCondition} " ng-hide="hideCondition" ng-bind-html="trust(extraIcon)"></button>',
        restrict: "E",
        link: function (t, n, o) {
          (t.trust = e.trustAsHtml),
            "new-folder-plus" === o.iconClass
              ? ((t.iconClass = "fa-folder-o fa-stack"),
                (t.extraIcon =
                  "<i class='fa fa-plus fa-stack-1x footer-icon-stack'>"))
              : ((t.iconClass = o.iconClass), (t.extraIcon = "")),
            (t.buttonTitle = o.itemTitle),
            null == o.activeCondition && (t.activeCondition = !0),
            null == o.disabledCondition && (t.disabledCondition = !1),
            (t.buttonIdentifier = o.identifier),
            null == o.hideCondition
              ? (t.hideCondition = !1)
              : (t.hideCondition = o.hideCondition),
            t.$watch("vm.itemDisplay", function (e, n) {
              t.vm.itemHidden(t.buttonIdentifier) && (t.hideCondition = !0);
            });
        },
      };
    }
    angular.module("MonstaFTP").directive("monstaFooterButton", e),
      (e.$inject = ["$sce"]);
  })(),
  angular.module("MonstaFTP").directive("monstaFooterMenuItem", function () {
    return {
      replace: !0,
      scope: {
        iconClass: "&",
        itemTitle: "&",
        activeCondition: "<?",
        disabledCondition: "<?",
        identifier: "&",
        vm: "=",
        hideCondition: "<?",
      },
      template:
        '<li class="{{ (activeCondition && vm.isLoggedIn) ? \'active\' : \'inactive\'}}" data-name="{{ buttonIdentifier }}" ng-click="vm.buttonClick(buttonIdentifier)" ng-hide="hideCondition"><a href="#" ng-class="{\'disabled-link\': disabledCondition }" ondragstart="return false;"><i class="fa fa-fw {{ iconClass }}"></i> {{ buttonTitle|translate }} </a></li>',
      restrict: "E",
      link: function (e, t, n) {
        (e.iconClass = n.iconClass),
          (e.buttonTitle = n.itemTitle),
          null == n.activeCondition && (e.activeCondition = !0),
          (e.buttonIdentifier = n.identifier),
          null == n.hideCondition && (e.hideCondition = !1),
          null == n.disabledCondition && (e.disabledCondition = !1),
          e.$watch("vm.itemDisplay", function (t, n) {
            e.vm.itemHidden(e.buttonIdentifier) && (e.hideCondition = !0);
          });
      },
    };
  }),
  (function () {
    function e(e, t, n, o, i) {
      e.history = [];
      var r = this;
      function a(e) {
        e.map(function (e) {
          t.removeEntry(e);
        });
      }
      function s() {
        var e = t.getUniqueHistory();
        r.sortedHistory = e.sort();
      }
      (r.sortedHistory = []),
        e.$on("directory-changed", function () {
          s();
        }),
        e.$on("history-changed", function () {
          s();
        }),
        (e.historyClick = function (e) {
          n.$broadcast("change-directory", e);
        }),
        e.$on("items-deleted", function (e, t) {
          a(t);
        }),
        e.$on("items-moved", function (e, t) {
          for (var n = [], o = 0; o < t.length; ++o) n.push(t[o][0]);
          a(n);
        }),
        e.$on("license-loaded", function () {
          o.isLicensed() &&
            i.getSystemConfiguration().then(
              function () {
                i.getApplicationSetting("hideHistoryBar") &&
                  document
                    .getElementsByTagName("body")[0]
                    .classList.add("no-history");
              },
              function () {}
            );
        });
    }
    angular.module("MonstaFTP").controller("HistoryController", e),
      (e.$inject = [
        "$scope",
        "historyFactory",
        "$rootScope",
        "licenseFactory",
        "configurationFactory",
      ]);
  })(),
  (function () {
    function e(e) {
      var t = "history-changed",
        n = function (e) {
          return e + ("/" != e.substr(e.length - 1) ? "/" : "");
        };
      return {
        _fullHistory: [],
        _historyIndex: -1,
        getFullHistory: function () {
          return this._fullHistory;
        },
        getFullHistoryCount: function () {
          return this._fullHistory.length;
        },
        addEntry: function (o) {
          (o = n(o)),
            this._historyIndex != this._fullHistory.length - 1 &&
              this._fullHistory.splice(this._historyIndex + 1),
            this._fullHistory.push(o),
            ++this._historyIndex,
            e.$broadcast(t);
        },
        removeEntry: function (o) {
          o = n(o);
          for (var i = !1, r = this._fullHistory.length - 1; r >= 0; --r) {
            var a = this._fullHistory[r];
            a.length < o.length ||
              (a.substr(0, o.length) == o &&
                (this._fullHistory.splice(r, 1), (i = !0)));
          }
          i && e.$broadcast(t);
        },
        getFullHistoryItem: function (e) {
          return this._fullHistory[e];
        },
        getHistoryIndex: function () {
          return this._historyIndex;
        },
        setHistoryIndex: function (n) {
          return (
            (this._historyIndex = n), e.$broadcast(t), this._fullHistory[n]
          );
        },
        hasPreviousHistoryItem: function () {
          return this._historyIndex > 0;
        },
        hasNextHistoryItem: function () {
          return (
            this._historyIndex > -1 &&
            this._historyIndex < this._fullHistory.length - 1
          );
        },
        navigateBack: function () {
          if (this.hasPreviousHistoryItem())
            return this.setHistoryIndex(this.getHistoryIndex() - 1);
        },
        navigateForward: function () {
          if (this.hasNextHistoryItem())
            return this.setHistoryIndex(this.getHistoryIndex() + 1);
        },
        getUniqueHistory: function () {
          if (0 == this.getFullHistoryCount()) return [];
          for (var e = [], t = this.getFullHistoryCount(); t-- > 0; ) {
            var n = this.getFullHistoryItem(t);
            -1 == e.indexOf(n) && e.push(n);
          }
          return e;
        },
        clearHistory: function () {
          (this._fullHistory = []), (this._historyIndex = -1), e.$broadcast(t);
        },
      };
    }
    angular.module("MonstaFTP").factory("historyFactory", e),
      (e.$inject = ["$rootScope"]);
  })(),
  (TransferStats.prototype.wasStarted = function () {
    (this.previousSampleTime = Date.now()),
      (this.completedItems = 0),
      (this.previousCompletedItems = 0);
  }),
  (TransferStats.prototype.incrementTransferAmount = function (e) {
    return this.updateTransferAmount(this.completedItems + e || 0);
  }),
  (TransferStats.prototype.updateTransferAmount = function (e) {
    var t = e === this.totalItems;
    return (
      !(
        !t &&
        Date.now() - this.previousSampleTime < TRANSFER_RATE_UPDATE_INTERVAL
      ) &&
      !(e < this.completedItems) &&
      !(!t && e - this.completedItems <= TRANSFER_ITEMS_MIN_UPDATE) &&
      ((this.previousCompletedItems = this.completedItems),
      (this.completedItems = e),
      this.addTransferRate(),
      !0)
    );
  }),
  (TransferStats.prototype.addTransferRate = function () {
    this._transferRateSamples.length == TRANSFER_RATE_SAMPLES_MAX &&
      this._transferRateSamples.splice(0, 1),
      this._transferRateSamples.push(this.getInstantaneousTransferRate());
  }),
  (TransferStats.prototype.calculateTransferRate = function () {
    if (0 == this._transferRateSamples.length) return 0;
    var e = 0;
    return (
      this._transferRateSamples.map(function (t) {
        e += t;
      }),
      e / this._transferRateSamples.length
    );
  }),
  (TransferStats.prototype.getInstantaneousTransferRate = function () {
    var e = Date.now() - this.previousSampleTime;
    return (
      (this.previousSampleTime = Date.now()),
      Math.round(
        ((this.completedItems - this.previousCompletedItems) / (e / 1e3)) * 10
      ) / 10
    );
  }),
  (TransferStats.prototype.getTransferPercent = function () {
    return 0 == this.totalItems ||
      null == this.totalItems ||
      null == this.completedItems
      ? 0
      : (100 * this.completedItems) / this.totalItems;
  }),
  (TransferStats.prototype.complete = function () {
    this.completedItems = this.totalItems;
  }),
  (TransferStats.prototype.hasBeenStarted = function () {
    return -1 != this.previousSampleTime;
  }),
  (function () {
    function e(e, t) {
      return {
        isNullLicense: !0,
        email: null,
        version: null,
        expiryDate: null,
        purchaseDate: null,
        productEdition: -1,
        getLicense: function () {
          var t = this;
          e.getLicense().then(
            function (e) {
              responseIsUnsuccessful(e)
                ? t.handleGetFailure.call(t, e)
                : t.handleGetSuccess.call(t, e);
            },
            function (e) {
              t.handleGetFailure.call(t, e);
            }
          );
        },
        handleGetSuccess: function (e) {
          var n = e.data.data;
          null == n
            ? (this.isNullLicense = !0)
            : ((this.email = n.email),
              (this.version = n.version),
              (this.expiryDate = 1e3 * n.expiryDate),
              (this.purchaseDate = 1e3 * n.purchaseDate),
              (this.isTrial = n.isTrial),
              (this.isNullLicense = !1),
              (this.productEdition = n.productEdition ? n.productEdition : 0)),
            t.$broadcast("license-loaded");
          var o = document.createEvent("CustomEvent");
          o.initEvent("load", !0, !0),
            (o.lType = this.productEdition),
            document.dispatchEvent(o);
        },
        handleGetFailure: function (e) {
          var n = "license reading";
          t.$broadcast("modal-error:show", parseErrorResponse(e, n), null, {
            action: n,
          });
        },
        isLicensed: function () {
          return !this.isNullLicense && !this.isLicenseExpired();
        },
        isLicenseExpired: function () {
          return (
            !this.isNullLicense &&
            null != this.expiryDate &&
            Date.now() > this.expiryDate
          );
        },
        isTrialLicense: function () {
          return !this.isNullLicense && !0 === this.isTrial;
        },
      };
    }
    angular.module("MonstaFTP").factory("licenseFactory", e),
      (e.$inject = ["connectionFactory", "$rootScope"]);
  })(),
  (function () {
    function e(e, t, n, o, i, r, a) {
      var s = this,
        l = "#modal-login-link";
      function c(e, t) {
        alert(t), e.select();
      }
      (s.show = function () {
        (s.configURL = o.getConfigURL(s.type, s.configuration)),
          (s.supportsCopy =
            ((e = r.navigator.userAgent),
            !!/chrome/i.test(e) ||
              (!/safari/i.test(e) &&
                null != document.queryCommandEnabled &&
                document.queryCommandEnabled("copy")))),
          n(l).modal("show");
        var e;
      }),
        (s.hide = function () {
          n(l).modal("hide"), e.$broadcast("modal-login:show");
        }),
        (s.copy = function () {
          var e = i.find("textarea")[0];
          e.select();
          var t = !1;
          try {
            t = document.execCommand("copy");
          } catch (e) {
            t = !1;
          }
          t ||
            a("COPY_FAILURE_MESSAGE").then(
              function (t) {
                c(e, t);
              },
              function () {
                c(
                  e,
                  "Unfortunately your browser does not support automatic copying, please copy the address from the text box."
                );
              }
            );
        }),
        t.$on("modal-login-link:show", function (e, t, n) {
          (s.type = t), (s.configuration = n), s.show();
        }),
        n(l).on("shown.bs.modal", function () {
          n(this).find("textarea").select();
        });
    }
    angular.module("MonstaFTP").controller("ModalLoginLinkController", e),
      (e.$inject = [
        "$rootScope",
        "$scope",
        "jQuery",
        "requestLoginFactory",
        "$element",
        "$window",
        "$translate",
      ]);
  })(),
  (function () {
    function e(e) {
      return e.jQuery;
    }
    angular.module("MonstaFTP").factory("jQuery", e), (e.$inject = ["$window"]);
  })(),
  (function () {
    function e(e, t, n, o, i, r, a, s, l) {
      var c = "#modal-login",
        u = this,
        d = !0,
        f = !1;
      function h(t) {
        e.storedAuthenticationErrorMessage = t;
      }
      function p(e) {
        o.$broadcast("modal-confirm:show", e, u.removeProfile);
      }
      function m(t, n) {
        "connection-display" == n
          ? (e.connectionErrorMessage = t)
          : "saved-profile-display" == n
          ? (e.storedAuthenticationErrorMessage = t)
          : o.$broadcast("modal-error:show", t);
      }
      function g(e, t, n, o, i) {
        var r;
        null == e
          ? (r = parseErrorResponse(t, n))
          : ((r = e.errorName), null != e.context && (o = e.context)),
          (o.action = n),
          a(r, o).then(
            function (e) {
              m(e, i);
            },
            function () {
              m(r, i);
            }
          );
      }
      function y(e) {
        u.setupInitialDirectory(e),
          u.transferConfigToAuthFactory(e),
          u.handleTestConfiguration(e);
      }
      function v(e) {
        return (
          null == u.connectionRestrictions ||
          "object" != typeof u.connectionRestrictions ||
          !u.connectionRestrictions.hasOwnProperty(e) ||
          !angular.isArray(u.connectionRestrictions[e].host)
        );
      }
      function E(e, t, n) {
        var o = e[t],
          i = !1;
        for (var r in n)
          if (n.hasOwnProperty(r)) {
            if (!0 === n[r] || 1 === n[r]) e[t][r] = null;
            else {
              var a = n[r];
              if ("host" === r && angular.isArray(a)) continue;
              if (null != a)
                a = new MessageFormat("en").compile(a)({
                  username: o.remoteUsername || o.username,
                });
              else if ("initialDirectory" == r) return !1;
              e[t][r] = a;
            }
            i = !0;
          }
        return i;
      }
      function A(e) {
        return (
          null == u.connectionRestrictions ||
          "object" != typeof u.connectionRestrictions ||
          "[object Array]" !=
            Object.prototype.toString.call(u.connectionRestrictions.types) ||
          0 == u.connectionRestrictions.types.length ||
          -1 != u.connectionRestrictions.types.indexOf(e)
        );
      }
      function S() {
        return (
          !0 !== u.applicationSettings.disableMasterLogin &&
          !R("master-login") &&
          r.isLicensed()
        );
      }
      function T(e, t) {
        return null == e
          ? ""
          : !t && e.name
          ? e.name
          : null == e.host || (null == e.username && null == e.remoteUsername)
          ? ""
          : (e.host || "host") +
            " / " +
            (e.username || e.remoteUsername || "username");
      }
      function R(e) {
        return !!r.isLicensed() && objectKeyIsFalse(u.loginItemDisplay, e);
      }
      (e.connectionErrorMessage = null),
        (e.storedAuthenticationErrorMessage = null),
        (e.defaults = g_ConnectionDefaults),
        (e.metaConfiguration = {
          rememberLogin: !1,
          masterPassword: null,
          savedProfileIndex: null,
          enteredProfileName: null,
        }),
        (e.hasServerSavedAuthentication = !1),
        (e.savedAuthentication = null),
        (e.licenseFactory = r),
        (e.metaConfiguration.saveAuthentication = !0),
        (e.systemConfiguration = {}),
        (e.configuration = {}),
        (u.connectionRestrictions = {}),
        (u.applicationSettings = {}),
        (u.isAuthenticated = !1),
        (u.showMissingLanguageMessage = !1),
        (u.ftpConnectionAvailable = g_ftpConnectionAvailable),
        (u.showPasswordManagementButton = !1),
        (u.showLoginLinkButton = !1),
        (u.loginItemDisplay = {}),
        (u.shouldShowPoweredBy = !0),
        (u.buildDefaultConfiguration = function () {
          var t = [
            ["ftp", "FTP"],
            ["sftp", "SFTP/SCP"],
          ];
          DEBUG && t.push(["mock", "Mock"]);
          e.connectionTypes = [];
          for (var n = 0; n < t.length; ++n)
            A(t[n][0]) && e.connectionTypes.push(t[n]);
          (e.configuration = {}),
            e.connectionTypes.length &&
              (e.connectionType = e.connectionTypes[0][0]);
          for (n = 0; n < e.connectionTypes.length; ++n)
            e.configuration[e.connectionTypes[n][0]] = {};
        }),
        (u.hide = function () {
          i(c).modal("hide");
        }),
        (u.show = function () {
          var t = {};
          (u.isAuthenticated = n.isAuthenticated),
            n.isAuthenticated
              ? ((t.backdrop = !0), (t.keyboard = !0))
              : ((t.backdrop = "static"), (t.keyboard = !1));
          u.updateHasServerSavedAuth();
          var o = i(c);
          f
            ? ((o.data("bs.modal").options.backdrop = t.backdrop),
              (o.data("bs.modal").options.keyboard = t.keyboard))
            : (o.modal(t), (f = !0));
          g_isNewWindowsInstall &&
            o.on("shown.bs.modal", function () {
              (u.showMissingLanguageMessage =
                "LOGIN" === i("#modal-login-label").text()),
                e.$apply();
            });
          o.modal("show");
        }),
        (u.handleError = function (e, t, n) {
          var o = getLocalizedErrorFromResponse(e),
            i = {};
          a(t).then(
            function (t) {
              g(o, e, t, i, n);
            },
            function () {
              g(o, e, t, i, n);
            }
          );
        }),
        (u.setupInitialDirectory = function (t) {
          var o = e.configuration,
            i = e.connectionType;
          "resume" === t
            ? (o[i].initialDirectory = n.initialDirectory)
            : (n.initialDirectory = o[i].initialDirectory);
        }),
        (u.writeAuthenticationToServer = function () {
          t.writeSavedAuth(
            e.metaConfiguration.masterPassword,
            e.savedAuthentication
          ).then(
            function (e) {
              responseIsUnsuccessful(e) && u.handleError(e, "saving profile");
            },
            function (e) {
              u.handleError(e, "saving profile");
            }
          );
        }),
        (u.saveCurrentAuthentication = function () {
          (null != e.savedAuthentication &&
            "object" == typeof e.savedAuthentication) ||
            (e.savedAuthentication = {});
          null == e.savedAuthentication[e.connectionType] &&
            (e.savedAuthentication[e.connectionType] = []);
          var t = angular.copy(e.configuration[e.connectionType]);
          t.name = e.metaConfiguration.enteredProfileName;
          var n = e.savedAuthentication[e.connectionType];
          "new" == e.metaConfiguration.savedProfileIndex
            ? n.push(t)
            : (n[e.metaConfiguration.savedProfileIndex] = t);
          u.writeAuthenticationToServer();
        }),
        (u.removeProfile = function () {
          e.savedAuthentication[e.connectionType].splice(
            e.metaConfiguration.savedProfileIndex,
            1
          ),
            (e.metaConfiguration.savedProfileIndex = Math.min(
              e.metaConfiguration.savedProfileIndex,
              e.savedAuthentication[e.connectionType].length - 1
            )),
            u.writeAuthenticationToServer();
        }),
        (u.initiateAuthenticationSave = function () {
          if (
            isEmpty(e.metaConfiguration.masterPassword) ||
            !e.metaConfiguration.saveAuthentication ||
            !e.hasServerSavedAuthentication
          )
            return;
          u.saveCurrentAuthentication();
        }),
        (u.handleAuthenticationSuccess = function (t, i) {
          var r = (function (e) {
              if (null == e.data) return {};
              if (null == e.data.data) return {};
              if (null == e.data.data.serverCapabilities) return {};
              return e.data.data.serverCapabilities;
            })(i),
            a = e.configuration,
            l = e.connectionType;
          for (var c in r)
            "initialDirectory" !== c || null === r[c]
              ? r.hasOwnProperty(c) && s.setServerCapability(c, r[c])
              : isEmpty(a[l].initialDirectory) &&
                ((a[l].initialDirectory = r[c]), (n.initialDirectory = r[c]));
          n.postLogin(),
            u.initiateAuthenticationSave(),
            u.hide(),
            o.$broadcast("login", t);
        }),
        (u.handleAuthenticationFailure = function (t, o) {
          if ("resume" === t || "url" === t) {
            if ("url" === t) {
              var i = s.getApplicationSetting("postLogoutUrl"),
                a = s.getApplicationSetting("disableLoginForm"),
                l = s.getApplicationSetting("loginFailureRedirect");
              if (
                (r.isLicensed() &&
                  null === l &&
                  null !== i &&
                  !0 === a &&
                  (l = i),
                null != l && "" !== l)
              ) {
                var c = -1 === l.indexOf("?") ? "?" : "&",
                  d = getLocalizedErrorFromResponse(o),
                  f = null === d ? "" : d.errorName;
                window.location = l + c + "MFTP_ERROR=" + encodeURIComponent(f);
              }
              (e.configuration[e.connectionType].password = null),
                (n.configuration[e.connectionType].password = null);
            }
            u.show();
          } else u.handleError(o, "authentication", "connection-display");
        }),
        (u.transferConfigToAuthFactory = function (t) {
          var o = angular.copy(e.configuration);
          u.applyRestrictionsToConfiguration(o),
            (n.configuration = o),
            "resume" != t &&
              (n.initialDirectory = o[e.connectionType].initialDirectory);
          (n.connectionType = e.connectionType),
            (n.rememberLogin = e.metaConfiguration.rememberLogin),
            (n.hasServerSavedAuthentication = e.hasServerSavedAuthentication);
        }),
        (u.successCallback = function (e, t) {
          responseIsUnsuccessful(t)
            ? u.handleAuthenticationFailure(e, t)
            : u.handleAuthenticationSuccess(e, t);
        }),
        (u.handleTestConfiguration = function (e) {
          t.testConnectAndAuthenticate(!0).then(
            function (t) {
              u.successCallback(e, t);
            },
            function (t) {
              u.handleAuthenticationFailure(e, t);
            }
          );
        }),
        (u.testConfiguration = y),
        (u.transferConfigFromAuthFactory = function () {
          (e.connectionType = n.connectionType || e.connectionTypes[0][0]),
            A(e.connectionType) || (e.connectionType = e.connectionTypes[0][0]);
          (e.metaConfiguration.rememberLogin = n.rememberLogin),
            (e.hasServerSavedAuthentication = n.hasServerSavedAuthentication);
        }),
        (u.initWithStoredAuth = function (t) {
          e.configuration = angular.copy(n.configuration);
          var o = u.applyRestrictionsToConfiguration(e.configuration);
          t || (!o && !n.isAuthenticated)
            ? u.show()
            : u.testConfiguration("resume");
          n.clearAuthConfiguration();
        }),
        (u.updateHasServerSavedAuth = function () {
          t.checkSavedAuthExists().then(
            function (t) {
              e.hasServerSavedAuthentication = !0 === t.data.data;
            },
            function () {
              (u.isAuthenticated = !1), (e.hasServerSavedAuthentication = !1);
            }
          );
        }),
        (u.addDefaultsToConfig = function () {
          e.configuration.ftp && (e.configuration.ftp.passive = !0);
        }),
        (u.initWithDefaultAuth = function (t) {
          u.addDefaultsToConfig(),
            u.applyRestrictionsToConfiguration(e.configuration) && !t
              ? y("resume")
              : u.show();
        }),
        (u.init = function (e) {
          var t = s.getApplicationSetting("postLogoutUrl"),
            o = s.getApplicationSetting("disableLoginForm");
          (e = !!e),
            u.buildDefaultConfiguration(),
            n.loadSettings(),
            u.transferConfigFromAuthFactory();
          var i = r.isLicensed();
          i &&
            ((u.shouldShowPoweredBy = !1),
            1 === r.productEdition &&
              (u.showPasswordManagementButton =
                (g_forgotPasswordAvailable &&
                  !0 === u.applicationSettings.enableForgotPassword) ||
                (g_resetPasswordAvailable &&
                  !0 === u.applicationSettings.enableResetPassword)),
            (u.showLoginLinkButton =
              !0 !== u.applicationSettings.disableLoginLinkButton));
          var a = null;
          d && i && (a = l.getConfigFromCurrentURL());
          g_isMonstaPostEntry ||
            null !== a ||
            !0 !== o ||
            null === t ||
            (window.location = t);
          null != a
            ? u.initWithURLConfig(a, e)
            : d && i && g_isMonstaPostEntry
            ? u.initWithPostedConfig()
            : n.hasStoredAuthenticationDetails()
            ? u.initWithStoredAuth(e)
            : u.initWithDefaultAuth(e);
        }),
        (u.handleCreateAuthSuccess = function () {
          (e.masterPasswordValid = !0), (e.hasServerSavedAuthentication = !0);
        }),
        (u.handleLoadSavedAuthSuccess = function (t) {
          (e.savedAuthentication = t.data.data), (e.masterPasswordValid = !0);
        }),
        (u.handleAuthFileFailure = function (t) {
          (e.masterPasswordValid = !1),
            u.handleError(
              t,
              "reading/writing the profile file",
              "saved-profile-display"
            );
        }),
        (u.performCreateAuthFile = function () {
          for (var n = {}, o = 0; o < e.connectionTypes.length; ++o)
            n[e.connectionTypes[o][0]] = [];
          t.writeSavedAuth(e.metaConfiguration.masterPassword, n).then(
            function (e) {
              responseIsUnsuccessful(e)
                ? u.handleAuthFileFailure(e)
                : u.handleCreateAuthSuccess(e);
            },
            function (e) {
              u.handleAuthFileFailure(e);
            }
          );
        }),
        (u.initiateLoadOfAuthFile = function () {
          t.readSavedAuth(e.metaConfiguration.masterPassword).then(
            function (e) {
              responseIsUnsuccessful(e)
                ? u.handleAuthFileFailure(e)
                : u.handleLoadSavedAuthSuccess(e);
            },
            function (e) {
              u.handleAuthFileFailure(e);
            }
          );
        }),
        (u.loadProfileAtIndex = function (t) {
          (e.configuration[e.connectionType] = angular.copy(
            e.savedAuthentication[e.connectionType][t]
          )),
            (e.metaConfiguration.enteredProfileName =
              e.configuration[e.connectionType].name);
        }),
        (u.loadNewProfile = function () {
          (e.configuration[e.connectionType] = {}),
            (e.metaConfiguration.enteredProfileName = null),
            u.addDefaultsToConfig();
        }),
        (u.configurationSettable = function (e, t) {
          if (
            null == u.connectionRestrictions ||
            "object" != typeof u.connectionRestrictions
          )
            return !0;
          if (!u.connectionRestrictions.hasOwnProperty(e)) return !0;
          if ("host" === t && angular.isArray(u.connectionRestrictions[e][t]))
            return !0;
          return !u.connectionRestrictions[e].hasOwnProperty(t);
        }),
        (u.applyRestrictionsToConfiguration = function (e) {
          if (
            null == u.connectionRestrictions ||
            "object" != typeof u.connectionRestrictions
          )
            return !1;
          var t = !1;
          for (var n in u.connectionRestrictions)
            if (
              u.connectionRestrictions.hasOwnProperty(n) &&
              e.hasOwnProperty(n)
            ) {
              var o = u.connectionRestrictions[n];
              null != o &&
                "object" == typeof u.connectionRestrictions &&
                (t = E(e, n, o));
            }
          return t;
        }),
        (u.shouldShowProfiles = S),
        (u.showLoginLink = function () {
          o.$broadcast(
            "modal-login-link:show",
            e.connectionType,
            e.configuration[e.connectionType]
          ),
            u.hide();
        }),
        (u.initWithURLConfig = function (t, o) {
          var i = {};
          (i[t.type] = t.configuration),
            (n.configuration = angular.copy(i)),
            (e.configuration = angular.copy(i)),
            u.applyRestrictionsToConfiguration(i),
            (e.connectionType = t.type),
            o ? u.show() : u.testConfiguration("url");
        }),
        (u.initWithPostedConfig = function () {
          var t = angular.copy(g_monstaPostEntryVars);
          delete t.settings,
            (n.configuration = angular.copy(t)),
            (e.configuration = angular.copy(t)),
            u.applyRestrictionsToConfiguration(t),
            (e.connectionType = t.type),
            u.testConfiguration("url");
        }),
        (u.profileIsSelected = function () {
          return (
            "" !== e.metaConfiguration.savedProfileIndex &&
            null !== e.metaConfiguration.savedProfileIndex
          );
        }),
        (u.getProfileName = T),
        (u.getDefaultProfileName = function () {
          return null == e ||
            null == e.configuration ||
            null == e.connectionType
            ? ""
            : T(e.configuration[e.connectionType], !0);
        }),
        (u.showDisabledSFTPAuthMessage = function () {
          return (
            null != e.configuration.sftp &&
            ((0 == u.sshAgentAuthEnabled &&
              "Agent" == e.configuration.sftp.authenticationModeName) ||
              (0 == u.sshKeyAuthEnabled &&
                "PublicKeyFile" == e.configuration.sftp.authenticationModeName))
          );
        }),
        (u.selectTab = function (t) {
          (e.connectionType = t),
            window.setTimeout(function () {
              e.$apply(function () {
                e.handleProfileChange();
              });
            });
        }),
        (u.showPasswordManager = function () {
          u.hide(), o.$broadcast("modal-password-management:show");
        }),
        (u.loginItemHidden = R),
        (u.hostEntryIsText = v),
        (u.getHostOptions = function (t) {
          if (v(t)) return [];
          var n = u.connectionRestrictions[t].host;
          return (
            (function (t, n) {
              void 0 === e.configuration[t] && (e.configuration[t] = {});
              if (0 === n.length || -1 !== n.indexOf(e.configuration[t].host))
                return;
              e.configuration[t].host = n[0];
            })(t, n),
            u.connectionRestrictions[t].host
          );
        }),
        (u.rememberLoginToggle = function () {
          !1 === e.metaConfiguration.rememberLogin &&
            n.clearAuthConfiguration();
        }),
        (e.connect = function () {
          (e.connectionErrorMessage = null), u.testConfiguration("form");
        }),
        (e.handleLoginKeyPress = function (t) {
          13 == t.which && e.connect();
        }),
        e.$on("logout", function () {
          d = !1;
          var e = !1;
          if (r.isLicensed()) {
            var t = s.getApplicationSetting("postLogoutUrl");
            null != t &&
              ((e = !0),
              window.setTimeout(function () {
                window.location = t;
              }, 200));
          }
          e || u.init(!0);
        }),
        e.$on("modal-login:show", function () {
          u.show();
        }),
        (e.handleAuthGo = function () {
          (e.connectionErrorMessage = null),
            isEmpty(e.metaConfiguration.masterPassword)
              ? a("PROFILE_SET_PASSWORD_ERROR").then(h, h)
              : ((e.storedAuthenticationErrorMessage = ""),
                e.hasServerSavedAuthentication
                  ? u.initiateLoadOfAuthFile()
                  : u.performCreateAuthFile());
        }),
        (e.masterPasswordKeypress = function (t) {
          13 === t.which && e.handleAuthGo();
        }),
        (e.handleProfileChange = function () {
          e.connectionErrorMessage = null;
          var t = e.metaConfiguration.savedProfileIndex;
          if ("new" != t) {
            var n = parseInt(t);
            isNaN(n) || u.loadProfileAtIndex(n);
          } else u.loadNewProfile();
        }),
        (e.initiateProfileDelete = function () {
          a("PROFILE_DELETE_CONFIRM_MESSAGE").then(p, p);
        }),
        (e.shouldHideDeleteButton = function () {
          return !S() || isNaN(parseInt(e.metaConfiguration.savedProfileIndex));
        }),
        e.$on("license-loaded", function () {
          u.init();
        }),
        s.getSystemConfiguration().then(
          function (t) {
            (u.sshAgentAuthEnabled = t.sshAgentAuthEnabled),
              (u.sshKeyAuthEnabled = t.sshKeyAuthEnabled),
              (e.systemConfiguration = t),
              (u.applicationSettings = t.applicationSettings),
              (u.connectionRestrictions =
                t.applicationSettings.connectionRestrictions),
              (u.loginItemDisplay =
                s.getApplicationSetting("loginItemDisplay") || {}),
              r.getLicense();
          },
          function (e) {
            r.getLicense();
          }
        );
    }
    angular.module("MonstaFTP").controller("LoginPanelController", e),
      (e.$inject = [
        "$scope",
        "connectionFactory",
        "authenticationFactory",
        "$rootScope",
        "jQuery",
        "licenseFactory",
        "$translate",
        "configurationFactory",
        "requestLoginFactory",
      ]);
  })(),
  (function () {
    function e(e, t, n, o, i, r) {
      var a = this;
      function s() {
        (a.formattedExpiryDate = o("date")(t.expiryDate, "d MMMM, yyyy")),
          (a.licenseExpired = t.isLicenseExpired()),
          (a.isLicensed = t.isLicensed()),
          (a.isTrialLicense = t.isTrialLicense()),
          a.isLicensed
            ? 1 == t.productEdition
              ? (a.productEditionShortName = "HOST_EDITION")
              : (a.productEditionShortName = "BUSINESS_EDITION")
            : (a.productEditionShortName = "STARTER_EDITION");
      }
      (a.show = function () {
        s(), e("#modal-addons").modal("show");
      }),
        (a.updateLicense = function () {
          if (!a.openSslAvailable) return;
          (a.licenseUpdateError = null),
            i.updateLicense(a.models.license).then(
              function () {
                t.getLicense(), (a.models.license = "");
              },
              function (e) {
                var t = e.data.localizedErrors[0];
                r(t.errorName, t.context).then(
                  function (e) {
                    a.licenseUpdateError = e;
                  },
                  function () {
                    a.licenseUpdateError = errorMessage;
                  }
                );
              }
            );
        }),
        (a.selectTab = function (e) {
          (a.activeTab = e),
            window.setTimeout(function () {
              n.$apply();
            });
        }),
        (a.models = { license: "" }),
        (a.licenseUpdateError = null),
        (a.activeTab = "addon-current"),
        (a.productEditionShortName = "STARTER_EDITION"),
        (a.openSslAvailable = g_openSslAvailable),
        n.$on("modal-addons:show", function () {
          a.show();
        }),
        n.$on("license-loaded", function () {
          s();
        });
    }
    angular.module("MonstaFTP").controller("ModalAddonsController", e),
      (e.$inject = [
        "jQuery",
        "licenseFactory",
        "$scope",
        "$filter",
        "connectionFactory",
        "$translate",
      ]);
  })(),
  (function () {
    function e(e, t, n) {
      var o = this,
        i = "#modal-choice";
      function r(e, t, n) {
        return e.replace(new RegExp(t, "g"), n);
      }
      function a(e) {
        null != e &&
          t(i).on("hidden.bs.modal", function () {
            t(i).off("hidden.bs.modal"), null != e && e(o.checkboxChecked);
          }),
          t(i).modal("hide");
      }
      (o.callbacks = []),
        (o.cancelCallback = null),
        (o.title = null),
        (o.message = null),
        (o.checkboxText = null),
        (o.checkboxChecked = !1),
        (o.show = function () {
          t(i).modal("show");
        }),
        (o.handleCallback = function (e) {
          a(o.callbacks[e][1]);
        }),
        (o.handleCancel = function () {
          a(o.cancelCallback);
        }),
        e.$on("modal-choice:show", function (t, i, a, s, l, c) {
          (i = r(i, "TAG_STRONG_START", "<strong>")),
            (i = r(i, "TAG_STRONG_END", "</strong>")),
            (a = r(a, "TAG_STRONG_START", "<strong>")),
            (a = r(a, "TAG_STRONG_END", "</strong>")),
            (o.title = i),
            (o.message = a),
            (o.callbacks = l),
            (o.cancelCallback = s),
            (o.checkboxText = c || null),
            (o.checkboxChecked = !1),
            n(function () {
              e.$apply(function () {
                o.show();
              });
            });
        });
    }
    angular.module("MonstaFTP").controller("ModalChoiceController", e),
      (e.$inject = ["$scope", "jQuery", "$timeout"]);
  })(),
  (function () {
    function e(e, t, n) {
      var o = this,
        i = "#modal-error";
      (o.message = ""),
        (o.show = function () {
          t(i).modal("show");
        }),
        (o.hide = function () {
          t(i).modal("hide"), o.dismissCallback && o.dismissCallback();
        }),
        (o.dismissCallback = function () {}),
        e.$on("modal-error:show", function (e, r, a, s) {
          n(r, s).then(
            function (e) {
              o.message = e;
            },
            function () {
              o.message = r;
            }
          ),
            (o.dismissCallback = a),
            t(i).modal("show");
        }),
        t(i).on("shown.bs.modal", function () {
          e.$apply();
        });
    }
    angular.module("MonstaFTP").controller("ModalErrorController", e),
      (e.$inject = ["$scope", "jQuery", "$translate"]);
  })(),
  angular.module("MonstaFTP").controller("ModalPasswordManagementController", [
    "$scope",
    "jQuery",
    "$rootScope",
    "connectionFactory",
    "licenseFactory",
    "configurationFactory",
    function (e, t, n, o, i, r) {
      var a = "#modal-password-management",
        s = this;
      function l() {
        s.model = {
          forgotPasswordUsername: "",
          resetPasswordUsername: "",
          currentPassword: "",
          resetPassword: "",
          confirmPassword: "",
        };
      }
      function c(e, t) {
        return null != e.data &&
          null != e.data.errors &&
          e.data.errors.length > 0 &&
          "" != e.data.errors[0]
          ? e.data.errors[0]
          : t;
      }
      function u(e, t) {
        return null != e.data && null != e.data.data && "" != e.data.data
          ? e.data.data
          : t;
      }
      (s.forgotPasswordAvailable = !1),
        (s.resetPasswordAvailable = !1),
        (s.forgotPasswordFailed = !1),
        (s.forgotPasswordSucceeded = !1),
        (s.resetPasswordFailed = !1),
        (s.resetPasswordSucceeded = !1),
        (s.forgotPasswordFailedMessage = "FORGOT_PASSWORD_FAILED"),
        (s.forgotPasswordSucceededMessage = "FORGOT_PASSWORD_SUCCEEDED"),
        (s.resetPasswordFailedMessage = "RESET_PASSWORD_FAILED"),
        (s.resetPasswordSucceededMessage = "RESET_PASSWORD_SUCCEEDED"),
        (s.show = function () {
          l(), t(a).modal("show");
        }),
        (s.showLoginPanel = function () {
          t(a).modal("hide"), n.$broadcast("modal-login:show");
        }),
        (s.initiateForgotPassword = function () {
          if (
            ((s.forgotPasswordFailed = !1),
            (s.forgotPasswordSucceeded = !1),
            "" === s.model.forgotPasswordUsername)
          )
            return (
              (s.forgotPasswordFailedMessage = "FORM_INCOMPLETE_ERROR"),
              void (s.forgotPasswordFailed = !0)
            );
          o.forgotPassword(s.model.forgotPasswordUsername).then(
            function (e) {
              (s.forgotPasswordSucceededMessage = u(
                e,
                "FORGOT_PASSWORD_SUCCEEDED"
              )),
                (s.forgotPasswordSucceeded = !0);
            },
            function (e) {
              (s.forgotPasswordFailedMessage = c(e, "FORGOT_PASSWORD_FAILED")),
                (s.forgotPasswordFailed = !0);
            }
          );
        }),
        (s.initiateResetPassword = function () {
          return (
            (s.resetPasswordFailed = !1),
            (s.resetPasswordSucceeded = !1),
            "" === s.model.resetPasswordUsername ||
            "" === s.model.currentPassword ||
            "" === s.model.resetPassword ||
            "" === s.model.confirmPassword
              ? ((s.resetPasswordFailedMessage = "FORM_INCOMPLETE_ERROR"),
                void (s.resetPasswordFailed = !0))
              : s.model.resetPassword !== s.model.confirmPassword
              ? ((s.resetPasswordFailedMessage = "PASSWORD_MISMATCH_ERROR"),
                void (s.resetPasswordFailed = !0))
              : void o
                  .resetPassword(
                    s.model.resetPasswordUsername,
                    s.model.currentPassword,
                    s.model.resetPassword
                  )
                  .then(
                    function (e) {
                      (s.resetPasswordSucceededMessage = u(
                        e,
                        "RESET_PASSWORD_SUCCEEDED"
                      )),
                        (s.resetPasswordSucceeded = !0);
                    },
                    function (e) {
                      (s.resetPasswordFailedMessage = c(
                        e,
                        "RESET_PASSWORD_FAILED"
                      )),
                        (s.resetPasswordFailed = !0);
                    }
                  )
          );
        }),
        l(),
        e.$on("modal-password-management:show", function () {
          s.show();
        }),
        e.$on("license-loaded", function () {
          i.isLicensed() &&
            1 === i.productEdition &&
            r.getSystemConfiguration().then(
              function () {
                (s.resetPasswordAvailable =
                  g_resetPasswordAvailable &&
                  r.getApplicationSetting("enableResetPassword")),
                  (s.forgotPasswordAvailable =
                    g_forgotPasswordAvailable &&
                    r.getApplicationSetting("enableForgotPassword")),
                  s.forgotPasswordAvailable
                    ? (s.currentTab = "forgot")
                    : (s.currentTab = "reset");
              },
              function () {}
            );
        });
    },
  ]),
  (function () {
    function e(e, t, n, o, i, r) {
      var a = "#modal-chmod",
        s = this;
      function l() {
        s.setPermissions(s.validateFormattedPermission(e.formattedPermissions));
      }
      function c(e, t, n) {
        null != e
          ? r([e.errorName, t], e.context).then(
              function (n) {
                s.permissionSaveError(n[e.errorName], { action: n[t] });
              },
              function () {
                s.permissionSaveError(parseErrorResponse(n, t), { action: t });
              }
            )
          : r(t).then(
              function (e) {
                s.permissionSaveError(parseErrorResponse(n, e), { action: e });
              },
              function () {
                s.permissionSaveError(parseErrorResponse(n, t), { action: t });
              }
            );
      }
      (e.filePaths = null),
        (e.permissions = null),
        (e.formattedPermissions = null),
        (e.invalidRange = !1),
        (e.saving = !1),
        (s.show = function () {
          o(a).modal("show"), (e.invalidRange = !1);
        }),
        (s.hide = function () {
          (e.filePaths = null), (e.invalidRange = !1), o(a).modal("hide");
        }),
        (s.validateFormattedPermission = function (t) {
          var n = parseInt(t, 8);
          (isNaN(n) || n < 0 || n > 511) && ((n = 0), (e.invalidRange = !0));
          return n;
        }),
        (s.formattedPermissionsChange = l),
        (s.setPermissions = function (t) {
          e.permissions = i.numericToObject(t);
        }),
        (s.zeroPadLeft = function (e) {
          for (; e.length < 3; ) e = "0" + e;
          return e;
        }),
        (s.setFormattedPermissions = function (t) {
          e.formattedPermissions = s.zeroPadLeft(t.toString(8));
        }),
        (s.permissionsChange = function () {
          null != e.permissions &&
            s.setFormattedPermissions(i.objectToNumeric(e.permissions));
        }),
        (s.permissionSaveError = function (n, o) {
          (e.saving = !1),
            r(["PERMISSIONS_FAILURE_PRECEDING_MESSAGE", n], o).then(function (
              e
            ) {
              t.$broadcast(
                "modal-error:show",
                e.PERMISSIONS_FAILURE_PRECEDING_MESSAGE + " " + e[n]
              );
            });
        }),
        (s.permissionSaveSuccess = function () {
          (e.saving = !1), t.$broadcast("change-directory"), s.hide();
        }),
        (s.initiatePermissionsSave = function () {
          var t = 0,
            o = i.objectToNumeric(e.permissions);
          (e.saving = !0),
            e.filePaths.map(function (i) {
              n.changePermissions(i, o).then(
                function () {
                  ++t == e.filePaths.length && s.permissionSaveSuccess();
                },
                function (e) {
                  var t = "CHANGE_PERMISSIONS_OPERATION",
                    n = getLocalizedErrorFromResponse(e);
                  null == n.context.operation && (n.context.operation = t),
                    r(n.context.operation).then(
                      function (t) {
                        (n.context.operation = t), c(n, t, e);
                      },
                      function () {
                        c(n, t, e);
                      }
                    );
                }
              );
            });
        }),
        e.$on("modal-permissions:show", function (t, n, o) {
          (e.filePaths = n), s.setPermissions(o), s.show();
        }),
        e.$watch("permissions", s.permissionsChange, !0),
        e.$watch("formattedPermissions", s.formattedPermissionsChange),
        (e.manualFocus = function () {
          e.invalidRange = !1;
        }),
        (e.okClick = function () {
          e.invalidRange || s.initiatePermissionsSave();
        }),
        (e.cancelClick = function () {
          s.hide();
        }),
        (e.keyUp = function (t) {
          if (13 == t.keyCode) {
            if (
              ((e.formattedPermissions = parseInt(t.target.value)),
              l(),
              e.invalidRange)
            )
              return;
            s.initiatePermissionsSave();
          }
        });
    }
    angular.module("MonstaFTP").controller("ModalPermissionsController", e),
      (e.$inject = [
        "$scope",
        "$rootScope",
        "connectionFactory",
        "jQuery",
        "permissionsFactory",
        "$translate",
      ]);
  })(),
  (function () {
    function e(e, t, n) {
      var o = "#modal-prompt",
        i = this;
      (this.setVars = function (t, o, i) {
        "" == t
          ? (e.title = t)
          : n(t).then(
              function (t) {
                e.title = t;
              },
              function () {
                e.title = t;
              }
            ),
          "" == i
            ? (e.placeHolder = i)
            : n(i).then(
                function (t) {
                  e.placeHolder = t;
                },
                function () {
                  e.placeHolder = i;
                }
              ),
          (e.initial = o),
          (e.final = o),
          (e.errorSet = !1),
          (e.errorMessage = ""),
          (e.isBusy = !1),
          (e.busyMessage = null),
          this.updateDismissMessage();
      }),
        (this.updateDismissMessage = function () {
          n(e.busyMessage || "DISMISS_OK_ACTION").then(
            function (t) {
              e.dismissMessage = t;
            },
            function (t) {
              e.dismissMessage = t;
            }
          );
        }),
        t(o).on("shown.bs.modal", function () {
          t(this).find("input[type=text]").focus();
        }),
        this.setVars("", "", ""),
        (this.successCallback = function () {}),
        (e.successClose = function () {
          i.successCallback(e.final, e.initial);
        }),
        (e.handlePromptKeypress = function (t) {
          13 == t.which && e.successClose();
        }),
        (this.show = function () {
          t(o).modal("show"), i.clearError(), i.clearBusy();
        }),
        (this.hide = function () {
          t(o).modal("hide");
        }),
        (this.clearError = function () {
          (e.errorSet = !1), (e.errorMessage = "");
        }),
        (this.setBusy = function (t) {
          (e.isBusy = !0), (e.busyMessage = t), this.updateDismissMessage();
        }),
        (this.clearBusy = function () {
          (e.isBusy = !1), (e.busyMessage = null), this.updateDismissMessage();
        }),
        e.$on("modal-prompt:show", function (e, t, n, o, r) {
          i.setVars(t, n, o), (i.successCallback = r), i.show();
        }),
        e.$on("modal-prompt:set-error", function (t, o) {
          (e.errorSet = !0),
            n(o).then(
              function (t) {
                e.errorMessage = t;
              },
              function () {
                e.errorMessage = o;
              }
            );
        }),
        e.$on("modal-prompt:clear-error", function () {
          i.clearError();
        }),
        e.$on("modal-prompt:hide", function () {
          i.hide();
        }),
        e.$on("modal-prompt:set-busy", function (e, t) {
          i.setBusy(t);
        }),
        e.$on("modal-prompt:clear-busy", function () {
          i.clearBusy();
        });
    }
    angular.module("MonstaFTP").controller("ModalPromptController", e),
      (e.$inject = ["$scope", "jQuery", "$translate"]);
  })(),
  (function () {
    function e(e, t) {
      var n = this,
        o = "#modal-properties";
      (n.item = null),
        (n.hide = function () {
          e(o).modal("hide");
        }),
        (n.show = function (t) {
          (n.item = t), e(o).modal("show");
        }),
        t.$on("modal-properties:show", function (e, t) {
          n.show(t);
        });
    }
    angular.module("MonstaFTP").controller("ModalPropertiesController", e),
      (e.$inject = ["jQuery", "$scope"]);
  })(),
  (function () {
    function e(e, t, n, o, i, r) {
      var a = "#modal-settings",
        s = this,
        l = [];
      function c(e) {
        showResponseError(e, "SYSTEM_VAR_LOAD_OPERATION", o, i);
      }
      (s.applicationSettings = {}),
        (s.show = function () {
          s.applicationSettings.showDotFiles, e(a).modal("show");
        }),
        (s.saveSettings = function () {
          for (var t in s.applicationSettings)
            s.applicationSettings.hasOwnProperty(t) &&
              r.setConfigurationItem(t, s.applicationSettings[t]);
          e(a).modal("hide");
        }),
        (s.debug = DEBUG),
        (s.systemShowDotFiles = !1),
        (s.languageFiles = g_languageFiles),
        n.getSystemConfiguration().then(function (e) {
          (s.systemShowDotFiles = e.applicationSettings.showDotFiles),
            (l = Object.keys(e.applicationSettings));
        }, c),
        t.$on("modal-settings:show", function () {
          r.getApplicationSettings().then(function () {
            for (var e = 0; e < l.length; ++e) {
              var t = l[e];
              s.applicationSettings[t] = r.getConfigurationItem(t);
            }
            s.show();
          }, c);
        }),
        o.$on("configuration:key-changed", function (e, t, n) {
          "language" === t && i.use(n);
        });
    }
    angular.module("MonstaFTP").controller("ModalSettingsController", e),
      (e.$inject = [
        "jQuery",
        "$scope",
        "configurationFactory",
        "$rootScope",
        "$translate",
        "localConfigurationFactory",
      ]);
  })(),
  (function () {
    function e(e, t, n, o, i, r, a) {
      var s = "#modal-transfers",
        l = this,
        c = null,
        u = !1,
        d = !1,
        f = !1;
      function h() {
        u || (o(s).modal("show"), (u = !0), (f = !1));
      }
      (l.updateUploads = function (o) {
        var r = angular.copy(e.getUploads());
        if (((t.allUploads = r), 0 === r.length)) {
          if (f) return;
          (c = null), i(l.hide, TRANSFER_COMPLETE_MODAL_HIDE_DELAY), (f = !0);
        } else {
          (l.totalUploads = r.length), (t.totalUploads = l.totalUploads);
          var a = o ? 0 : 200;
          o && null != c && (clearTimeout(c), (c = null)),
            null == c &&
              ((l.uploads = r),
              (c = i(function () {
                n.$apply(), (c = null);
              }, a)));
        }
      }),
        (l.uploadFinished = function (e, n) {
          n
            ? ((l.currentUploadNumber = Math.min(
                l.currentUploadNumber + 1,
                l.completedUploadTotal
              )),
              (d = !0))
            : (--l.completedUploadTotal,
              l.completedUploadTotal < 0 && (l.completedUploadTotal = 0));
          (t.currentUploadNumber = l.currentUploadNumber),
            (t.completedUploadTotal = l.completedUploadTotal),
            l.updateUploads();
        }),
        (l.show = h),
        (l.hide = function () {
          d && t.$broadcast("change-directory");
          o(s).modal("hide"), (u = !1);
        }),
        (l.abortItem = function (t) {
          e.abortItem(t), l.updateUploads();
        }),
        (l.abortAll = function () {
          e.abortAll();
        }),
        (l.remotePathToRelative = function (e) {
          var t = a.currentDirectory;
          "/" != t.substr(t.length - 1) && (t += "/");
          var n = 0;
          "/" == e.substr(0, 1) && ((e = e.substr(1)), (n = 1));
          return e.substr(t.length - n);
        }),
        (l.uploadAdded = function () {
          (l.completedUploadTotal = e.getUploads().length),
            (t.completedUploadTotal = l.completedUploadTotal);
          for (var n = e.getUploads(), o = [], i = 0; i < n.length; i++)
            o.push({
              name: n[i].name,
              remotePath: n[i].remotePath,
              total: n[i].stats.totalItems,
              id: n[i].uploadId,
            });
          (t.allStats = o),
            (t.uploadPos = 0),
            (t.partsCompleted = 0),
            (t.itemTotal = n[0].stats.totalItems),
            (t.itemName = n[0].name),
            (t.itemPath = n[0].remotePath),
            l.updateUploads(),
            h();
        }),
        (l.fsFilter = r("file_size")),
        (l.uploads = []),
        (l.itemToAbort = null),
        (l.currentUploadNumber = 1),
        (l.completedUploadTotal = 0),
        (l.totalUploads = 0),
        (e.updateCallback = l.updateUploads),
        n.$on("upload:load", l.uploadFinished),
        n.$on("upload:add", l.uploadAdded),
        n.$on("upload:update", function (e, t) {
          (d = d || t), l.updateUploads();
        }),
        (l.remainingFilesMessage = ""),
        o(s).on("hidden.bs.modal", function () {
          (l.uploads = []),
            (l.currentUploadNumber = 1),
            (t.currentUploadNumber = l.currentUploadNumber),
            (d = !1);
        });
    }
    angular.module("MonstaFTP").controller("ModalTransferController", e),
      (e.$inject = [
        "uploadFactory",
        "$rootScope",
        "$scope",
        "jQuery",
        "$timeout",
        "$filter",
        "uiOperationFactory",
      ]);
  })(),
  (function () {
    function e(e, t) {
      return {
        restrict: "E",
        scope: { transfer: "=" },
        template: "<div></div>",
        link: (n, o, i) => {
          var r,
            a = function () {
              o.html(
                (function (t, n, o) {
                  var i = "";
                  t.stats.completedItems == t.stats.totalItems &&
                    (i = " progress-bar-striped"),
                    t.hasError || (i += " active");
                  for (var r = e(t), a = 0, s = 0; s < n.allStats.length; s++) {
                    for (
                      var l = n.allStats[s], c = !1, u = 0;
                      u < n.allUploads.length;
                      u++
                    )
                      if (n.allUploads[u].uploadId == l.id) {
                        (a += Math.max(
                          n.allUploads[u].stats.completedItems,
                          0
                        )),
                          (c = !0);
                        break;
                      }
                    c || (a += 2 * l.total), l.total;
                  }
                  var d = 0,
                    f = 0,
                    h = 0,
                    p = 0,
                    m = 0,
                    g = "",
                    y = "",
                    v = n.prevPos || 0,
                    E = n.prevRatio || 0;
                  for (s = 0; s < n.allStats.length; s++) {
                    var A = d + 0;
                    if ((d += 2 * (l = n.allStats[s]).total) >= a) {
                      (h = (a - A) / (d - A)),
                        (f = s) == v &&
                          0 != f &&
                          h <= E &&
                          ((E += (1 - E) / 4), (h = Math.min(E, 1))),
                        (p = l.total * h),
                        (m = l.total),
                        (g = l.name),
                        (y = l.remotePath);
                      break;
                    }
                  }
                  return (
                    (n.uploadPos = f),
                    (n.partsCompleted = p),
                    (n.itemTotal = m),
                    (n.itemName = g),
                    (n.itemPath = y),
                    (n.prevPos = f),
                    (n.prevRatio = h),
                    '<div class="progress-bar progress-bar-success' +
                      i +
                      '" role="progressbar" aria-valuenow="' +
                      (r = Math.round(1e4 * h) / 100) +
                      '" aria-valuemin="0" aria-valuemax="100" style="width: ' +
                      r +
                      '%;"></div>'
                  );
                })(n.transfer, n.$root, i.stage)
              );
            };
          a(),
            (r = t(a, 500)),
            n.$on("$destroy", function () {
              t.cancel(r);
            }),
            n.$watch(
              "transfer.stats",
              function () {
                a();
              },
              !0
            ),
            n.$watch(
              "transfer.archiveExtractCurrent",
              function () {
                a();
              },
              !0
            );
        },
      };
    }
    angular.module("MonstaFTP").directive("uploadProgressBar", e),
      (e.$inject = ["transfer_percentFilter", "$interval"]);
  })(),
  angular
    .module("MonstaFTP")
    .controller(
      "ModalUpgradeRequiredController",
      ModalUpgradeRequiredController
    ),
  (ModalUpgradeRequiredController.$inject = [
    "$rootScope",
    "jQuery",
    "$translate",
  ]),
  (String.prototype.hashCode = function () {
    var e,
      t = 0;
    if (0 === this.length) return t;
    for (e = 0; e < this.length; e++)
      (t = (t << 5) - t + this.charCodeAt(e)), (t |= 0);
    return t;
  }),
  angular.module("MonstaFTP").factory("permissionsFactory", function () {
    return {
      objectToNumeric: function (e) {
        return (
          (e.ownerRead ? 256 : 0) +
          (e.ownerWrite ? 128 : 0) +
          (e.ownerExecute ? 64 : 0) +
          (e.groupRead ? 32 : 0) +
          (e.groupWrite ? 16 : 0) +
          (e.groupExecute ? 8 : 0) +
          (e.otherRead ? 4 : 0) +
          (e.otherWrite ? 2 : 0) +
          (e.otherExecute ? 1 : 0)
        );
      },
      numericToObject: function (e) {
        return {
          ownerRead: 0 != (256 & e),
          ownerWrite: 0 != (128 & e),
          ownerExecute: 0 != (64 & e),
          groupRead: 0 != (32 & e),
          groupWrite: 0 != (16 & e),
          groupExecute: 0 != (8 & e),
          otherRead: 0 != (4 & e),
          otherWrite: 0 != (2 & e),
          otherExecute: 0 != (1 & e),
        };
      },
    };
  }),
  (String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }),
  "function" != typeof String.prototype.trim &&
    (String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    }),
  (function () {
    function e(e, t, n, o, i, r, a) {
      var s = this,
        l = null,
        c = ["logout", "change-server", "settings", "addons", "help"];
      function u() {
        null != l && l.close("slidebar");
      }
      function d(e) {
        u(), n.$broadcast("modal-confirm:show", e, s.confirmLogout);
      }
      (s.showHelpButton = !0),
        (s.showAddOnsButton = !0),
        (s.showChangeServerButton = !0),
        (s.customHelpUrl = null),
        (s.itemDisplay = {}),
        o("#slidebar").ready(function () {
          (l = new slidebars()).init();
        }),
        o("#slidebar-toggle").click(function () {
          null != l && l.toggle("slidebar");
        }),
        (s.confirmLogout = function () {
          u(), t.logout(), n.$broadcast("logout");
        }),
        (s.initiateLogout = function () {
          u(), i("LOGOUT_CONFIRM_MESSAGE").then(d, d);
        }),
        (s.showAddonsModal = function () {
          u(), n.$broadcast("modal-addons:show");
        }),
        (s.showSettingsModal = function () {
          u(), n.$broadcast("modal-settings:show");
        }),
        (s.showLoginPanel = function () {
          u(), n.$broadcast("modal-login:show");
        }),
        (s.itemHidden = function (e) {
          return !!s.itemDisplay.hasOwnProperty(e) && !1 === s.itemDisplay[e];
        }),
        e.$on("license-loaded", function () {
          a.isLicensed() &&
            r.getSystemConfiguration().then(
              function () {
                var e, t;
                (s.showHelpButton =
                  !r.getApplicationSetting("disableHelpButton")),
                  (s.showAddOnsButton = !r.getApplicationSetting(
                    "disableAddOnsButton"
                  )),
                  (s.customHelpUrl = r.getApplicationSetting("helpUrl")),
                  (s.showChangeServerButton = !r.getApplicationSetting(
                    "disableChangeServerButton"
                  )),
                  (s.itemDisplay =
                    r.getApplicationSetting("sidebarItemDisplay") || {}),
                  (e = allInterfaceOptionsDisabled(c, s.itemDisplay)),
                  (t = document.getElementsByTagName("body")[0]),
                  e
                    ? t.classList.add("no-slidebar")
                    : t.classList.remove("no-slidebar");
              },
              function () {}
            );
        }),
        e.$on("file-editor:will-show", function () {
          u();
        });
    }
    angular.module("MonstaFTP").controller("SlidebarController", e),
      (e.$inject = [
        "$scope",
        "authenticationFactory",
        "$rootScope",
        "jQuery",
        "$translate",
        "configurationFactory",
        "licenseFactory",
      ]);
  })(),
  angular.module("MonstaFTP").controller("ModalConfirmController", [
    "$scope",
    "jQuery",
    function (e, t) {
      var n = "#modal-confirm",
        o = this;
      (o.message = ""),
        (o.okCallback = null),
        (o.cancelCallback = null),
        (o.show = function () {
          t(n).modal("show");
        }),
        (o.ok = function () {
          t(n).modal("hide"),
            null != o.okCallback && (o.okCallback(), (o.okCallback = null));
        }),
        (o.cancel = function () {
          t(n).modal("hide"),
            null != o.cancelCallback &&
              (o.cancelCallback(), (o.cancelCallback = null));
        }),
        e.$on("modal-confirm:show", function (e, t, n, i) {
          (o.message = t),
            (o.okCallback = void 0 === n ? null : n),
            (o.cancelCallback = void 0 === i ? null : i),
            o.show();
        });
    },
  ]),
  (function () {
    function e(e) {
      return {
        cutSource: null,
        copySource: null,
        currentDirectory: "",
        currentDirectoryList: [],
        setCutSource: function (t) {
          (this.cutSource = t),
            (this.copySource = null),
            null != t && e.$broadcast("paste-source:set");
        },
        setCopySource: function (t) {
          (this.copySource = t),
            (this.cutSource = null),
            null != t && e.$broadcast("paste-source:set");
        },
        pasteComplete: function () {
          null != this.cutSource && e.$broadcast("paste-source:cleared"),
            (this.cutSource = null);
        },
        clearCutAndCopySource: function () {
          (this.copySource = null),
            (this.cutSource = null),
            e.$broadcast("paste-source:cleared");
        },
        isCutOrCopySource: function (e) {
          return e == this.copySource || e == this.cutSource;
        },
        joinNameToCurrentDirectory: function (e) {
          return pathJoin(this.currentDirectory, e);
        },
        itemIsInCurrentDirectoryList: function (e) {
          for (var t = 0; t < this.currentDirectoryList.length; ++t)
            if (this.currentDirectoryList[t].name === e) return !0;
          return !1;
        },
        itemInCurrentDirectoryIsDirectory: function (e) {
          for (var t = 0; t < this.currentDirectoryList.length; ++t)
            if (this.currentDirectoryList[t].name === e)
              return !!this.currentDirectoryList[t].isDirectory;
          return !1;
        },
      };
    }
    angular.module("MonstaFTP").factory("uiOperationFactory", e),
      (e.$inject = ["$rootScope"]);
  })(),
  (function () {
    function e(e, t, n, o, i, r) {
      var a = this,
        s = "#modal-update";
      function l() {
        (a.automaticUpgradeUnavailableReasons = []),
          o.isLicensed()
            ? ((a.isLicensed = !0),
              (a.automaticUpgradeAvailable = !0),
              n.checkSavedAuthExists().then(
                function (e) {
                  (a.hasServerSavedAuthentication = !0 === e.data.data),
                    a.hasServerSavedAuthentication ||
                      ((a.automaticUpgradeAvailable = !1),
                      (a.automaticUpgradeUnavailableReason =
                        "AUTOMATIC_UPGRADE_REQUIRES_PROFILE_PASSWORD_MESSAGE")),
                    t(s).modal("show");
                },
                function () {
                  (a.hasServerSavedAuthentication = !1),
                    (a.automaticUpgradeAvailable = !1),
                    a.automaticUpgradeUnavailableReasons.push(
                      "AUTOMATIC_UPGRADE_REQUIRES_PROFILE_PASSWORD_MESSAGE"
                    ),
                    t(s).modal("show");
                }
              ))
            : ((a.isLicensed = !1),
              (a.automaticUpgradeAvailable = !1),
              t(s).modal("show")),
          r.getSystemConfiguration().then(
            function (e) {
              e.curlAvailable ||
                (a.automaticUpgradeUnavailableReasons.push(
                  "CURL_NOT_INSTALLED_MESSAGE"
                ),
                (a.automaticUpgradeAvailable = !1));
            },
            function (e) {}
          );
      }
      function c(e, t) {
        var n,
          o = getLocalizedErrorFromResponse(e),
          r = {};
        null == o
          ? (n = parseErrorResponse(e, t))
          : ((n = o.errorName), void 0 !== o.context && (r = o.context)),
          i(n, r).then(
            function (e) {
              a.storedAuthenticationErrorMessage = e;
            },
            function () {
              a.storedAuthenticationErrorMessage = n;
            }
          );
      }
      function u() {
        "" !== a.model.masterPassword &&
          n.validateSavedAuthPassword(a.model.masterPassword).then(
            function (e) {
              !0 === e.data.data
                ? ((a.storedAuthenticationErrorMessage = ""),
                  (a.startUpgradeEnabled = !0))
                : ((a.storedAuthenticationErrorMessage =
                    "PROBABLE_INCORRECT_PASSWORD_ERROR"),
                  (a.startUpgradeEnabled = !1));
            },
            function (e) {
              c(e, "validating password");
            }
          );
      }
      function d() {
        return "STRONG_TAG_START" + a.latestVersion + "STRONG_TAG_END";
      }
      function f(e) {
        a.latestVersionMessage = e.LATEST_VERSION_AVAILABLE_MESSAGE.replace(
          /STRONG_TAG_START/g,
          "<strong>"
        ).replace(/STRONG_TAG_END/g, "</strong>");
        var t = "A_TAG_START" + e.RELEASE_NOTES_UPGRADE_LINK_TEXT + "A_TAG_END",
          n = "A_TAG_START" + e.UPGRADE_DOWNLOAD_LINK_TEXT + "A_TAG_END";
        i(
          [
            "PRE_UPGRADE_RELEASE_NOTES_MESSAGE",
            "AUTOMATIC_UPGRADE_LICENSED_ONLY_MESSAGE",
          ],
          { release_notes_link: t, download_link: n }
        ).then(h, function (e) {});
      }
      function h(e) {
        var t = e.PRE_UPGRADE_RELEASE_NOTES_MESSAGE,
          n = e.AUTOMATIC_UPGRADE_LICENSED_ONLY_MESSAGE;
        (t = t.replace(
          /A_TAG_START/g,
          '<a href="' +
            RELEASE_NOTES_URL +
            '" target="mftp-new" rel="noopener noreferrer">'
        )),
          (a.releaseNotesMessage = t.replace(/A_TAG_END/g, "</a>")),
          (n = n.replace(
            /A_TAG_START/g,
            '<a href="' +
              MFTP_DOWNLOAD_URL +
              '" target="mftp-new" rel="noopener noreferrer">'
          )),
          (a.licensedOnlyMessage = n.replace(/A_TAG_END/g, "</a>"));
      }
      (a.latestVersion = window.MONSTA_LATEST_VERSION),
        (a.latestVersionFormatted = d()),
        (a.licensedOnlyMessage = ""),
        (a.releaseNotesMessage = ""),
        (a.hasServerSavedAuthentication = !1),
        (a.isLicensed = !1),
        (a.startUpgradeEnabled = !1),
        (a.storedAuthenticationErrorMessage = ""),
        (a.modalTitle = "UPDATE_AVAILABLE"),
        (a.downloadInProgress = !1),
        (a.installInProgress = !1),
        (a.automaticUpgradeAvailable = !1),
        (a.automaticUpgradeUnavailableReason = ""),
        (a.upgradeComplete = !1),
        (a.upgradeCompleteMessage = ""),
        (a.refresh = function () {
          window.location = window.location;
        }),
        (a.model = { masterPassword: "" }),
        (a.show = l),
        (a.hide = function () {
          t(s).modal("hide");
        }),
        (a.handlePasswordKeypress = function (e) {
          13 === e.which && u();
        }),
        (a.validatePassword = u),
        (a.startUpgrade = function () {
          if (!a.startUpgradeEnabled) return !1;
          (a.downloadInProgress = !0),
            (a.modalTitle = "UPGRADING_TITLE"),
            n.downloadLatestVersionArchive(a.model.masterPassword).then(
              function (e) {
                (a.downloadInProgress = !1),
                  !0 === e.data.data
                    ? ((a.installInProgress = !0),
                      n.installLatestVersion(a.model.masterPassword).then(
                        function (e) {
                          (a.installInProgress = !1),
                            !0 === e.data.data
                              ? ((a.upgradeComplete = !0),
                                i("UPGRADE_COMPLETE_MESSAGE", {
                                  version: a.latestVersion,
                                }).then(
                                  function (e) {
                                    a.upgradeCompleteMessage = e;
                                  },
                                  function (e) {
                                    a.upgradeCompleteMessage =
                                      "UPGRADE_COMPLETE_MESSAGE";
                                  }
                                ))
                              : c(e, "installing upgrade");
                        },
                        function (e) {
                          (a.installInProgress = !1),
                            c(e, "installing upgrade");
                        }
                      ))
                    : c(e, "downloading upgrade");
              },
              function (e) {
                (a.downloadInProgress = !1), c(e, "downloading upgrade");
              }
            );
        }),
        e.$on("modal-update:show", function () {
          (a.latestVersion = window.MONSTA_LATEST_VERSION),
            (a.latestVersionFormatted = d()),
            i(
              [
                "LATEST_VERSION_AVAILABLE_MESSAGE",
                "RELEASE_NOTES_UPGRADE_LINK_TEXT",
                "UPGRADE_DOWNLOAD_LINK_TEXT",
              ],
              { version: a.latestVersionFormatted }
            ).then(f, function (e) {}),
            l();
        });
    }
    angular.module("MonstaFTP").controller("UpdateController", e),
      (e.$inject = [
        "$scope",
        "jQuery",
        "connectionFactory",
        "licenseFactory",
        "$translate",
        "configurationFactory",
        "$sce",
      ]);
  })(),
  (function () {
    function e(e) {
      (e.spinnerVisible = !1),
        e.$on("request-count-change", function (t, n) {
          e.spinnerVisible = 0 != n;
        });
    }
    angular.module("MonstaFTP").controller("SpinnerController", e),
      (e.$inject = ["$scope"]);
  })(),
  (function () {
    function e(e, t, n, o, i, r, a) {
      var s = o("file_size"),
        l = !1,
        c = !1;
      function u(e) {
        i.$broadcast("modal-error:show", e, function () {});
      }
      function d(e, t) {
        for (var n = 0; n < t.length; ++n) {
          var o = t[n];
          e += "<br>&nbsp;&nbsp;&nbsp;&nbsp;" + o[0] + " (" + s(o[1]) + ")";
        }
        u(e);
      }
      function f(e, t, n) {
        t.$broadcast(
          "modal-choice:show",
          "EXTRACT_AFTER_UPLOAD_TITLE",
          n,
          function () {
            e.filesToQueue.splice(e.fileQueueIndex, 1), e.processUploadQueue();
          },
          [
            [
              "UPLOAD_STANDARD_ACTION",
              function () {
                e.uploadStandardCallback();
              },
            ],
            [
              "UPLOAD_EXTRACT_ACTION",
              function () {
                e.uploadAndExtractCallback();
              },
            ],
          ]
        );
      }
      function h(e) {
        e.filesToQueue.splice(e.fileQueueIndex, 1), e.processUploadQueue();
      }
      function p(e, t, n, o, i) {
        t.$broadcast(
          "modal-choice:show",
          n,
          o,
          function () {
            e.cancelAll();
          },
          [
            [
              "UPLOAD_OVERWRITE_ACTION",
              function (t) {
                t && ((l = !0), (c = !1)), e.confirmOverwriteCallback(i);
              },
            ],
            [
              "UPLOAD_KEEP_ACTION",
              function (t) {
                t && ((l = !1), (c = !0)), h(e);
              },
            ],
          ],
          "APPLY_TO_ALL"
        );
      }
      return {
        tooLargeFiles: [],
        filesToQueue: [],
        fileQueueIndex: 0,
        treeTotalSize: 0,
        treeProcessed: 0,
        traverseFinished: !1,
        directoryReader: null,
        directoryEntries: [],
        uploadStandardCallback: function () {
          (this.filesToQueue[this.fileQueueIndex][4] = !1),
            this.processUploadQueue();
        },
        uploadAndExtractCallback: function () {
          (this.filesToQueue[this.fileQueueIndex][4] = !0),
            this.processUploadQueue();
        },
        promptForExtract: function (e) {
          var t = this;
          r("EXTRACT_AFTER_UPLOAD_MESSAGE", {
            file_name: "TAG_STRONG_START" + e + "TAG_STRONG_END",
            file_type:
              "TAG_STRONG_START" + extractFileExtension(e) + "TAG_STRONG_END",
          }).then(
            function (e) {
              f(t, i, e);
            },
            function () {
              f(t, i, "Extract " + e + " after uploading?");
            }
          );
        },
        displayConfirmOverwrite: function (e) {
          var t = this;
          c
            ? h(this)
            : l
            ? this.confirmOverwriteCallback(e)
            : r(
                [
                  "CONFIRM_UPLOAD_OVERWRITE_MESSAGE",
                  "CONFIRM_UPLOAD_OVERWRITE_TITLE",
                ],
                { file_name: "TAG_STRONG_START" + e + "TAG_STRONG_END" }
              ).then(
                function (n) {
                  p(
                    t,
                    i,
                    n.CONFIRM_UPLOAD_OVERWRITE_TITLE,
                    n.CONFIRM_UPLOAD_OVERWRITE_MESSAGE,
                    e
                  );
                },
                function () {
                  p(
                    t,
                    i,
                    "Replace " + e + "?",
                    e + " exists, replace it with the one you are uploading?",
                    e
                  );
                }
              );
        },
        confirmOverwriteCallback: function (n) {
          var o = this;
          e.itemInCurrentDirectoryIsDirectory(n)
            ? t
                .deleteDirectory(e.joinNameToCurrentDirectory(n))
                .then(function () {
                  ++o.fileQueueIndex, o.processUploadQueue();
                })
            : (++this.fileQueueIndex, this.processUploadQueue());
        },
        processUploadQueue: function () {
          if (this.fileQueueIndex >= this.filesToQueue.length)
            return this.checkTooLargeFiles(), void this.performUploads();
          var t = this.filesToQueue[this.fileQueueIndex];
          null == t[4] && isExtractSupported(t[0])
            ? this.promptForExtract(t[0])
            : !a.getApplicationSetting("disableUploadOverwriteConfirmation") &&
              t[5] &&
              e.itemIsInCurrentDirectoryList(t[0])
            ? this.displayConfirmOverwrite(t[0])
            : (++this.fileQueueIndex, this.processUploadQueue());
        },
        cancelAll: function () {
          (this.filesToQueue = []),
            (this.fileQueueIndex = 0),
            (this.tooLargeFiles = []);
        },
        performUploads: function () {
          for (var e = 0; e < this.filesToQueue.length; ++e) {
            var t = this.filesToQueue[e];
            n.addUpload(t[0], t[1], t[2], t[3], t[4]);
          }
          (this.filesToQueue = []),
            (this.fileQueueIndex = 0),
            (this.tooLargeFiles = []);
        },
        checkTooLargeFiles: function () {
          if (0 != this.tooLargeFiles.length) {
            var e = this.tooLargeFiles.slice();
            r("UPLOAD_FILES_TOO_LARGE_MESSAGE", {
              item_count: this.tooLargeFiles.length,
              maximum_size: s(MAX_UPLOAD_BYTES),
            }).then(
              function (t) {
                d(t, e);
              },
              function (t) {
                d(t, e);
              }
            );
          }
        },
        doUploadAdd: function (t, n, o, i) {
          if (
            !a.getApplicationSetting("skipMacOsSpecialFiles") ||
            ".DS_Store" !== t.name
          ) {
            var r = e.joinNameToCurrentDirectory(n);
            t.size > MAX_UPLOAD_BYTES
              ? this.tooLargeFiles.push([n, t.size])
              : this.filesToQueue.push([t.name, r, t, t.size, o, i]);
          }
        },
        readItemsInDirectory: function (e, t, n, o) {
          o || (o = null);
          var i = this;
          t.createReader().readEntries(function (r) {
            if (!r.length) return void o();
            i.directoryEntries = i.directoryEntries.concat(r);
            let a = r,
              s = 0,
              l = a.length;
            for (let r = 0; r < a.length; ++r)
              i.traverseFileTree.call(i, a[r], pathJoin(e, t.name), n, () => {
                s++, s >= l && o();
              });
          });
        },
        traverseFileTree: function (e, t, n, o) {
          o || (o = null), (t = t || "");
          var i = this;
          e.isFile
            ? (++i.treeTotalSize,
              o(),
              e.file(function (o) {
                ++i.treeProcessed;
                var r = pathJoin(t, e.name);
                i.doUploadAdd.call(i, o, r, n, "" === t),
                  i.traverseFinished &&
                    i.treeProcessed === i.treeTotalSize &&
                    i.processUploadQueue();
              }))
            : e.isDirectory && this.readItemsInDirectory(t, e, n, o);
        },
        handleItemsBasedUpload: function (e, t) {
          (l = !1),
            (c = !1),
            (this.tooLargeFiles = []),
            (this.filesToQueue = []),
            (this.fileQueueIndex = 0),
            (this.treeTotalSize = 0),
            (this.treeProcessed = 0),
            (this.traverseFinished = !1);
          let n = e.length;
          for (var o = 0; o < e.length; ++o) {
            var i = e[o].webkitGetAsEntry();
            i &&
              this.traverseFileTree(i, null, t, () => {
                n >= n &&
                  ((this.fileQueueIndex = 0), (this.traverseFinished = !0));
              });
          }
        },
        handleFilesBasedUpload: function (e, t) {
          (l = !1),
            (c = !1),
            (this.tooLargeFiles = []),
            (this.filesToQueue = []),
            (this.fileQueueIndex = 0);
          var n = 0,
            o = this,
            i = function () {
              if (n == e.length) {
                for (h = 0; h < e.length; ++h) {
                  var i = (p = e[h]).webkitRelativePath
                    ? p.webkitRelativePath
                    : p.name;
                  o.doUploadAdd.call(o, p, i, t, -1 === i.indexOf("/"));
                }
                o.processUploadQueue();
              }
            };
          if (null == window.FileReader) return (n = e.length), void i();
          var a = function () {
              ++n, i();
            },
            s = function () {
              r("FOLDER_UPLOAD_NOT_SUPPORTED_MESSAGE").then(u, u);
            };
          if (0 != e.length)
            for (
              var d = window.navigator.userAgent,
                f = /trident/i.test(d) || /msie/i.test(d),
                h = 0;
              h < e.length;
              ++h
            )
              if (f) a();
              else {
                var p = e[h],
                  m = new FileReader();
                (m.onerror = function (e) {
                  s();
                }),
                  (m.onload = a);
                try {
                  var g = p.slice(0, Math.min(p.size, 1024));
                  0 == g.size ? m.readAsArrayBuffer(p) : m.readAsArrayBuffer(g);
                } catch (e) {
                  console.log(e);
                }
              }
          else s();
        },
      };
    }
    angular.module("MonstaFTP").factory("uploadUIFactory", e),
      (e.$inject = [
        "uiOperationFactory",
        "connectionFactory",
        "uploadFactory",
        "$filter",
        "$rootScope",
        "$translate",
        "configurationFactory",
      ]);
  })(),
  (function () {
    function e(e) {
      var t = {};
      function n(e) {
        if (isEmpty(e)) return null;
        "/" == e.substr(0, 1) && (e = e.substr(1));
        var n = e.split("/");
        if (n.length < 4 || "c" != n[0]) return null;
        var o = n[1],
          i = n[2],
          r = null,
          a = n.slice(3, n.length).join("/");
        try {
          r = t.decodeConfiguration(a);
        } catch (e) {
          return null;
        }
        if (("_" != o && (r.configuration.host = o), "_" != i)) {
          var s = "sftp" == r.type ? "remoteUsername" : "username";
          r.configuration[s] = i;
        }
        return r;
      }
      function o(e, t) {
        var n = {},
          o = (function (e) {
            for (
              var t = [
                  ["passive", "v"],
                  ["ssl", "s"],
                  ["password", "p"],
                  ["initialDirectory", "i"],
                  ["port", "o"],
                  ["authenticationModeName", "m"],
                  ["privateKeyFilePath", "r"],
                  ["publicKeyFilePath", "q"],
                ],
                n = e ? 1 : 0,
                o = e ? 0 : 1,
                i = {},
                r = 0;
              r < t.length;
              ++r
            )
              i[t[r][o]] = t[r][n];
            return i;
          })(e);
        for (var i in t)
          if (t.hasOwnProperty(i)) {
            var r = t[i];
            o.hasOwnProperty(i) && (i = o[i]),
              e
                ? !0 === r
                  ? (r = 1)
                  : !1 === r && (r = 0)
                : (1 === r && (r = !0), 0 === r && (r = !1)),
              (n[i] = r);
          }
        return n;
      }
      return (
        (t.encodeConfiguration = function (e, n) {
          void 0 !== n.name && delete n.name;
          var o = { t: e, c: t.compactConfigKeys(n) };
          return encodeURIComponent(b64EncodeUnicode(JSON.stringify(o)));
        }),
        (t.decodeConfiguration = function (e) {
          var n = JSON.parse(b64DecodeUnicode(decodeURIComponent(e)));
          return { type: n.t, configuration: t.uncompactConfigKeys(n.c) };
        }),
        (t.getPreHashURL = function () {
          return e.absUrl().split("#")[0];
        }),
        (t.getConfigURL = function (e, n) {
          if (null == n) return null;
          n = angular.copy(n);
          var o = null,
            i = null;
          n.hasOwnProperty("host") && ((o = n.host), delete n.host);
          var r = "sftp" == e ? "remoteUsername" : "username";
          n.hasOwnProperty(r) && ((i = n[r]), delete n[r]);
          o = isEmpty(o) ? "_" : encodeURIComponent(o);
          i = isEmpty(i) ? "_" : encodeURIComponent(i);
          var a = "/c/" + o + "/" + i + "/" + t.encodeConfiguration(e, n);
          return t.getPreHashURL() + "#" + a;
        }),
        (t.compactConfigKeys = function (e) {
          return o(!0, e);
        }),
        (t.uncompactConfigKeys = function (e) {
          return o(!1, e);
        }),
        (t.decodePostHash = n),
        (t.getConfigFromCurrentURL = function () {
          var t = e.absUrl().split("#");
          return 1 == t.length ? null : n(t[1]);
        }),
        (t.getFormFieldHTML = function (e, t) {
          var n = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
          return (
            (t = String(t).replace(/[&<>"]/g, function (e) {
              return n[e];
            })),
            '<input type="hidden" name="' + e + '" value="' + t + '">'
          );
        }),
        t
      );
    }
    angular.module("MonstaFTP").factory("requestLoginFactory", e),
      (e.$inject = ["$location"]);
  })(),
  (function () {
    function e(e) {
      for (
        var t = "",
          n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        t.length < e;

      )
        t += n.charAt(Math.floor(Math.random() * n.length));
      return t;
    }
    function t(t, n, o, i) {
      var r = 2097152;
      return (
        i.getSystemConfiguration().then(
          function (e) {
            r = e.chunkUploadSize;
          },
          function () {}
        ),
        {
          updateCallback: null,
          _uploads: [],
          _activeUploadCount: 0,
          addUpload: function (t, o, i, r, a) {
            return (
              !(-1 != MAX_UPLOAD_BYTES && r > MAX_UPLOAD_BYTES) &&
              (this._uploads.push({
                name: t,
                remotePath: o,
                file: i,
                request: null,
                stats: new TransferStats(r),
                hasError: !1,
                isArchive: a,
                archiveExtractMax: 0,
                archiveExtractCurrent: -1,
                sessionKey: null,
                isAngularRequest: !1,
                errorText: null,
                uploadId: e(16),
              }),
              n.$broadcast("upload:add"),
              this._activeUploadCount < MAX_CONCURRENT_UPLOADS &&
                this.startUploadOfItemAtIndex(
                  this._uploads.length - 1,
                  this._uploads[this._uploads.length - 1]
                ),
              !0)
            );
          },
          addExtract: function (e, t, o) {
            var i = new TransferStats(1);
            (i.transferType = "extract"), i.complete();
            var r = {
              name: e,
              localRelativePath: null,
              remotePath: null,
              file: null,
              request: null,
              stats: i,
              hasError: !1,
              isArchive: !0,
              archiveExtractMax: o,
              archiveExtractCurrent: 0,
              sessionKey: null,
              forceComplete: !0,
              isAngularRequest: !1,
            };
            this._uploads.push(r),
              this.progressExtract(t, r, o, 0),
              n.$broadcast("upload:add");
          },
          startNextItem: function () {
            if (!(this._activeUploadCount >= MAX_CONCURRENT_UPLOADS))
              for (var e = 0; e < this._uploads.length; ++e)
                if (!this._uploads[e].stats.hasBeenStarted()) {
                  this.startUploadOfItemAtIndex(e, this._uploads[e]);
                  break;
                }
          },
          getUploads: function () {
            return this._uploads;
          },
          getUploadItem: function (e) {
            return this._uploads[e];
          },
          progressItem: function (e, t) {
            e.stats.updateTransferAmount(t) &&
              null != this.updateCallback &&
              this.updateCallback();
          },
          getUploadRequestBody: function (e, n) {
            var o = t.getRequestBody();
            return (
              (o.actionName = n ? UPLOAD_ARCHIVE_ACTION : UPLOAD_ACTION),
              (o.context = { remotePath: e }),
              o
            );
          },
          encodeRequestBody: function (e) {
            return b64EncodeUnicode(JSON.stringify(e));
          },
          getXHR: function () {
            return new XMLHttpRequest();
          },
          startXHR: function (e, t, n) {
            ++this._activeUploadCount,
              e.open("POST", UPLOAD_PATH),
              e.setRequestHeader("X-Monsta", this.encodeRequestBody(t)),
              e.setRequestHeader("Content-Type", "application/octet-stream"),
              e.send(n),
              null != this.updateCallback && this.updateCallback(!0);
          },
          startMultiStageUploadXHR: function (e, t, n) {
            e.open("POST", MULTI_STAGE_UPLOAD_PATH + "?sessionKey=" + t),
              e.setRequestHeader("Content-Type", "application/octet-stream"),
              e.send(n),
              null != this.updateCallback && this.updateCallback(!0);
          },
          finalRequestFinishFailure: function (e, t) {
            var n = this;
            safeConsoleError(e);
            var i = null,
              r = !1;
            try {
              var a = JSON.parse(e.responseText),
                s = getLocalizedErrorFromResponseData(a);
              (i = getErrorMessageFromResponseData(a)),
                null !== s &&
                  ((r = !0),
                  o([s.errorName, s.context.operation], s.context).then(
                    function (o) {
                      var i = o[s.errorName];
                      (i = i.replace(
                        s.context.operation,
                        o[s.context.operation]
                      )),
                        n.setItemError(t, e.status, e.statusText, i);
                    },
                    function () {
                      n.setItemError(t, e.status, e.statusText, i);
                    }
                  ));
            } catch (e) {}
            r || this.setItemError(t, e.status, e.statusText, i);
          },
          addEventProgressListenersToRequest: function (e, t, n, o, i) {
            var r = this;
            e.upload.addEventListener(
              "progress",
              function (n) {
                e.readyState == XMLHttpRequest.OPENED &&
                  r.progressItem(t, n.lengthComputable ? o + n.loaded : null);
              },
              !1
            ),
              e.upload.addEventListener(
                "load",
                function () {
                  (t.stats.completedItems = i),
                    null != r.updateCallback && r.updateCallback();
                },
                !1
              ),
              (e.onreadystatechange = function () {
                e.readyState === XMLHttpRequest.DONE &&
                  (200 === e.status
                    ? FEATURE_MULTI_STAGE_UPLOAD
                      ? r.transferItemAtIndexToRemote(t)
                      : FEATURE_CHUNKED_UPLOAD
                      ? r.processChunk(t, i)
                      : r.completeItem(t, e.responseText, !1, !0)
                    : 0 !== e.status && r.finalRequestFinishFailure(e, t));
              });
          },
          startStandardUploadOfItemAtIndex: function (e) {
            var t = this._uploads[e],
              n = this.getXHR();
            t.request = n;
            var o = this.getUploadRequestBody(t.remotePath, t.isArchive);
            this.addEventProgressListenersToRequest(n, t, e),
              this.startXHR(n, o, t.file),
              t.stats.wasStarted();
          },
          startMultiStageUploadOfItemAtIndex: function (e, t) {
            var n = this._uploads[e],
              o = this.getXHR();
            (n.request = o),
              (n.sessionKey = t),
              this.addEventProgressListenersToRequest(o, n, e),
              this.startMultiStageUploadXHR(o, t, n.file),
              n.stats.wasStarted();
          },
          startUploadOfItemAtIndex: function (e, i) {
            if (FEATURE_MULTI_STAGE_UPLOAD) {
              ++this._activeUploadCount;
              var r = this,
                a = this._uploads[e];
              t.reserveUploadContext(UPLOAD_ACTION, a.remotePath).then(
                function (t) {
                  responseIsUnsuccessful(t)
                    ? showResponseError(t, "UPLOAD_OPERATION", n, o)
                    : r.startMultiStageUploadOfItemAtIndex(e, t.data.data);
                },
                function (e) {
                  showResponseError(e, "UPLOAD_OPERATION", n, o);
                }
              );
            } else
              FEATURE_CHUNKED_UPLOAD
                ? this.startChunkedUploadOfItemAtIndex(i)
                : this.startStandardUploadOfItemAtIndex(e);
          },
          uploadChunk: function (e, t, n, o) {
            var i = new XMLHttpRequest();
            (e.request = i),
              this.addEventProgressListenersToRequest(i, e, null, n, o),
              i.open(
                "POST",
                CHUNKED_UPLOAD_PATH + "?action=progress&uploadId=" + e.uploadId
              ),
              i.send(new Blob([t]));
          },
          transferUploadToServer: function (e) {
            var t = this.getUploadRequestBody(e.remotePath, e.isArchive),
              i = this,
              r = new FormData();
            r.append("request", JSON.stringify(t));
            var a = new XMLHttpRequest();
            (a.onreadystatechange = function () {
              if (a.readyState === XMLHttpRequest.DONE)
                if (200 === a.status) {
                  i.completeItem(e, a.responseText, !1, !0);
                  let t = a.response;
                  if ("string" == typeof t)
                    try {
                      (t = JSON.parse(t)),
                        (t = { data: t }),
                        t.data.errors &&
                          (console.log(t.data.errors),
                          showResponseError(t, "UPLOAD_OPERATION", n, o));
                    } catch (e) {
                      console.log(e);
                    }
                } else if (0 !== a.status) {
                  if ((i.finalRequestFinishFailure(a, e), 577 === a.status)) {
                    let e = a.response;
                    "string" == typeof e &&
                      ((e = JSON.parse(e)),
                      (e = { data: e }),
                      e.data.errors &&
                        ((e.data.errors[0] =
                          "Could not upload the file as the account quota has been exceeded."),
                        (e.data.localizedErrors[0].errorName =
                          "QUOTA_EXCEEDED_MESSAGE")),
                      console.log(e)),
                      showResponseError(e, "UPLOAD_OPERATION", n, o),
                      setTimeout(() => {
                        let e = a.response;
                        "string" == typeof e &&
                          ((e = JSON.parse(e)),
                          (e = { data: e }),
                          e.data.errors &&
                            ((e.data.errors[0] =
                              "Could not upload the file as the account quota has been exceeded."),
                            (e.data.localizedErrors[0].errorName =
                              "QUOTA_EXCEEDED_MESSAGE")),
                          console.log(e)),
                          showResponseError(e, "UPLOAD_OPERATION", n, o);
                      }, 500),
                      setTimeout(() => {
                        let e = a.response;
                        "string" == typeof e &&
                          ((e = JSON.parse(e)),
                          (e = { data: e }),
                          e.data.errors &&
                            ((e.data.errors[0] =
                              "Could not upload the file as the account quota has been exceeded."),
                            (e.data.localizedErrors[0].errorName =
                              "QUOTA_EXCEEDED_MESSAGE")),
                          console.log(e)),
                          showResponseError(e, "UPLOAD_OPERATION", n, o);
                      }, 3e3),
                      setTimeout(() => {
                        let e = a.response;
                        "string" == typeof e &&
                          ((e = JSON.parse(e)),
                          (e = { data: e }),
                          e.data.errors &&
                            ((e.data.errors[0] =
                              "Could not upload the file as the account quota has been exceeded."),
                            (e.data.localizedErrors[0].errorName =
                              "QUOTA_EXCEEDED_MESSAGE")),
                          console.log(e)),
                          showResponseError(e, "UPLOAD_OPERATION", n, o);
                      }, 6e3);
                  } else {
                    let e = a.response;
                    "string" == typeof e &&
                      ((e = JSON.parse(e)), (e = { data: e }), console.log(e)),
                      showResponseError(e, "UPLOAD_OPERATION", n, o);
                  }
                  console.log(a);
                }
            }),
              a.open(
                "POST",
                CHUNKED_UPLOAD_PATH + "?action=finish&uploadId=" + e.uploadId
              ),
              a.send(r);
          },
          processChunk: function (e, t) {
            var o = this;
            if (t === e.file.size)
              return (
                e.stats.complete(),
                n.$broadcast("upload:update", !1),
                void setTimeout(() => {
                  o.transferUploadToServer(e);
                }, 300)
              );
            var i = Math.min(t + r, e.file.size),
              a = e.file.slice(t, i),
              s = new FileReader();
            s.addEventListener("load", function () {
              if (null === s.result) throw "Reader result is null";
              o.uploadChunk(e, s.result, t, i);
            }),
              s.readAsArrayBuffer(a);
          },
          startChunkedUploadOfItemAtIndex: function (e) {
            var t = this.getUploadRequestBody(e.remotePath, !1),
              n = this,
              o = new FormData();
            o.append("request", JSON.stringify(t));
            var i = new XMLHttpRequest();
            (e.request = i),
              (i.onreadystatechange = function () {
                i.readyState === XMLHttpRequest.DONE &&
                  (200 === i.status
                    ? n.processChunk(e, 0)
                    : n.finalRequestFinishFailure(i, e));
              }),
              i.open(
                "POST",
                CHUNKED_UPLOAD_PATH + "?action=initiate&uploadId=" + e.uploadId
              ),
              i.send(o);
          },
          handleExtractProgressErrorResponse: function (e, i, r) {
            (i.request = null),
              i.shouldAbort
                ? t.cleanUpExtract(r)
                : showResponseError(e, "EXTRACT_ARCHIVE_OPERATION", n, o),
              n.$broadcast("upload:update", !0),
              this.completeItem(i, null, !0, !1);
          },
          handleExtractProgressSuccessResponse: function (e, o, i, r, a) {
            if (void 0 === e.data.errors) {
              o.request = null;
              var s = e.data.data[0],
                l = e.data.data[1];
              (o.archiveExtractCurrent = Math.min(a + l, r)),
                o.stats.updateTransferAmount(o.archiveExtractCurrent),
                n.$broadcast("upload:update", !0),
                s
                  ? this.completeItem(o, null, !0, !0)
                  : !0 === o.shouldAbort
                  ? t.cleanUpExtract(i)
                  : this.progressExtract(i, o, r, a + l);
            } else this.handleExtractProgressErrorResponse(e, o, i);
          },
          progressExtract: function (e, o, i, r) {
            var a = this,
              s = t.extractArchive(e, r, 1e4);
            (o.request = s),
              (o.isAngularRequest = !0),
              n.$broadcast("upload:update"),
              s.promise.then(
                function (t) {
                  a.handleExtractProgressSuccessResponse(t, o, e, i, r);
                },
                function (t) {
                  a.handleExtractProgressErrorResponse(t, o, e);
                }
              );
          },
          transferItemAtIndexToRemote: function (e) {
            var i = this;
            t.transferUploadToRemote(e.sessionKey).then(
              function (t) {
                responseIsUnsuccessful(t)
                  ? showResponseError(t, "UPLOAD_OPERATION", n, o)
                  : i.completeItem(e, null, !1, !0);
              },
              function (t) {
                showResponseError(t, "UPLOAD_OPERATION", n, o),
                  i.completeItem(e, null, !1, !1);
              }
            );
          },
          completeItem: function (e, t, o, i) {
            var r = this;
            if (e.isArchive && !o) {
              var a = JSON.parse(t);
              (e.archiveExtractCurrent = 0),
                (e.archiveExtractMax = a.fileCount),
                (e.stats = new TransferStats(a.fileCount)),
                (e.stats.transferType = "extract"),
                this.progressExtract(a.fileKey, e, a.fileCount, 0);
            } else
              --this._activeUploadCount,
                (e.request = null),
                e.stats.complete(),
                this.removeItem(e),
                setTimeout(function () {
                  r.broadcastComplete.call(r, i);
                }, 0);
            n.$broadcast("upload:update");
          },
          broadcastComplete: function (e) {
            n.$broadcast("upload:load", e),
              this.startNextItem(),
              null != this.updateCallback && this.updateCallback(!0);
          },
          abortItemUploadRequest: function (e) {
            e.isArchive ||
              null == e.request ||
              (e.request.abort(), (e.request = null)),
              e.isArchive &&
                ((e.shouldAbort = !0),
                null != e.request &&
                  (e.isAngularRequest
                    ? e.request.cancel("aborted")
                    : e.request.abort(),
                  (e.request = null)));
          },
          abortItem: function (e) {
            (e = this.getOriginalUploadItem(e)),
              --this._activeUploadCount,
              this.abortItemUploadRequest(e),
              this.removeItem(e),
              n.$broadcast("upload:abort"),
              this.startNextItem();
          },
          removeItem: function (e) {
            this._uploadIterator(function (t, n) {
              if (e.remotePath == n.remotePath)
                return null != n.request || this._uploads.splice(t, 1), !1;
            });
          },
          setItemError: function (e, t, n, o) {
            (e.hasError = !0),
              (e.statusCode = t),
              (e.statusText = n),
              (e.errorText = o),
              null != e.request &&
                ((e.request = null),
                null != this.updateCallback && this.updateCallback(!0));
          },
          _uploadIterator: function (e) {
            for (
              var t = 0;
              t < this._uploads.length &&
              !1 !== e.call(this, t, this._uploads[t]);
              ++t
            );
          },
          abortAll: function () {
            for (var e = 0; e < this._uploads.length; ++e) {
              var t = this._uploads[e];
              this.abortItemUploadRequest(t);
            }
            (this._uploads = []),
              (this._activeUploadCount = 0),
              null != this.updateCallback && this.updateCallback(!0);
          },
          getOriginalUploadItem: function (e) {
            var t = null;
            return (
              this._uploadIterator(function (n, o) {
                if (e.remotePath == o.remotePath) return (t = o), !1;
              }),
              t
            );
          },
        }
      );
    }
    angular.module("MonstaFTP").factory("uploadFactory", t),
      (t.$inject = [
        "connectionFactory",
        "$rootScope",
        "$translate",
        "configurationFactory",
      ]);
  })(),
  document.addEventListener("load", mCheckFn);
//# sourceMappingURL=monsta-min-2.10.3.js.map
