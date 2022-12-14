<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS, PATCH, DELETE');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, x-xsrf-token, x_csrftoken, Cache-Control, X-Requested-With');
    session_start();
    require_once(dirname(__FILE__) . "/constants.php");
    require_once(dirname(__FILE__) . '../../../settings/config.php');

    includeMonstaConfig();
    require_once(dirname(__FILE__) . '/request_processor/RequestMarshaller.php');
    require_once(dirname(__FILE__) . '/lib/helpers.php');
    require_once(dirname(__FILE__) . '/lib/response_helpers.php');
    require_once(dirname(__FILE__) . '/file_sources/MultiStageUploadHelper.php');

    dieIfNotPOST();

    require_once(dirname(__FILE__) . '/lib/access_check.php');
    if(!ALLOW_CHUNKED_UPLOAD){
        $response= array(
            "success" => false,
            'message' => "method not allowed",
        );
        return print json_encode($response);
    }
    if (!isset($_GET['action']) || !isset($_GET['uploadId'])) {
        die();
    }

    $mftpUploadAction = $_GET['action'];
    $mftpUploadId = $_GET['uploadId'];

    set_time_limit(300);

    function mftpGenerateChunkedSessionKey($uploadId) {
        return 'UPLOAD_KEY_' . $uploadId;
    }

    function getChunkedTempPathFromSession($uploadId) {
        $sessionKey = mftpGenerateChunkedSessionKey($uploadId);

        if (!isset($_SESSION[$sessionKey])) {
            throw new Exception("Session key not set.");
        }

        return $_SESSION[$sessionKey];
    }

    function mftpChunkedUploadInitiate($marshaller, $uploadId, $request) {
        $sessionKey = mftpGenerateChunkedSessionKey($uploadId);

        $marshaller->testConfiguration($request);
        $fileName = monstaBasename($request['context']['remotePath']);

        $tempFilePath = tempnam(sys_get_temp_dir(), $fileName);
        $_SESSION[$sessionKey] = $tempFilePath;
    }

    function mftpChunkedUploadProgress($uploadId) {
        $tempFilePath = getChunkedTempPathFromSession($uploadId);
        readUpload($tempFilePath, "a");
    }

    function mftpChunkedUploadFinish($marshaller, $uploadId, $request) {
        $sessionKey = mftpGenerateChunkedSessionKey($uploadId);

        $tempFilePath = getChunkedTempPathFromSession($uploadId);

        try {
            $request['context']['localPath'] = $tempFilePath;

            try {
                if ($request['actionName'] == "uploadArchive") {
                    $remotePath = $request['context']['remotePath'];

                    $ext = pathinfo($remotePath, PATHINFO_EXTENSION);
                    $newFilePath = monstaReplaceExtension($tempFilePath, $ext);
                    rename($tempFilePath, $newFilePath);
                    $tempFilePath = $newFilePath;
                    $request['context']['localPath'] = $tempFilePath;

                    $applicationSettings = new ApplicationSettings(APPLICATION_SETTINGS_PATH);
    
                    $extractor = new ArchiveExtractor($newFilePath, null, $applicationSettings->getSkipMacOsSpecialFiles());
    
                    $archiveFileCount = $extractor->getFileCount(); // will throw exception if it's not valid
    
                    $fileKey = generateRandomString(16);
    
                    $_SESSION[MFTP_SESSION_KEY_PREFIX . $fileKey] = array(
                        "archivePath" => $newFilePath,
                        "extractDirectory" => PathOperations::remoteDirname($request['context']['remotePath'])
                    );
    
                    $response = array(
                        "success" => true,
                        "fileKey" => $fileKey,
                        "fileCount" => $archiveFileCount
                    );
    
                    print json_encode($response);
                } else {
                    print $marshaller->marshallRequest($request);
                }
            } catch (Exception $e) {
                cleanupTempTransferPath($tempFilePath);
                throw $e;
            }
        } catch (Exception $e) {
            if(file_exists($tempFilePath)){
                unlink($tempFilePath);
            }
            unset($_SESSION[$sessionKey]);
            throw $e;
        }

        $ext = pathinfo($tempFilePath, PATHINFO_EXTENSION);
        if ($ext == 'tmp') {
            unlink($tempFilePath);
        }
        unset($_SESSION[$sessionKey]);
    }

    try {
        if ($mftpUploadAction === "progress") {
            mftpChunkedUploadProgress($mftpUploadId);

        } else if ($mftpUploadAction === "initiate" || $mftpUploadAction === "finish") {
            $marshaller = new RequestMarshaller();
            $request = json_decode($_POST['request'], true);

            if ($mftpUploadAction === "initiate") {
                mftpChunkedUploadInitiate($marshaller, $mftpUploadId, $request);
            } else {
                mftpChunkedUploadFinish($marshaller, $mftpUploadId, $request);
            }
        } else {
            throw new Exception("Unknown action $mftpUploadAction.");
        }
    } catch (Exception $e) {
        handleExceptionInRequest($e);
    }
