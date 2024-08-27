<?php
H::includeFromLib('MyActivityFromRequestBase');

class MyActivityFromRequest extends MyActivityFromRequestBase {
	public function parse($url, $addParams) {
		$resp = parent::parse($url, $addParams);
		if ($resp != null) {
			return $resp;
		}
		
		return null;
	}
}
?>